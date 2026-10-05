import { flushSync } from "react-dom";
import { EMPOWER_MS } from "./empowerTiming";
import { useEffect, useRef, useState } from "react";
import { cards, type CardId } from "../../../packages/content/index";
import { FOREST_ENEMY_IDS } from "../../../packages/engine/forest";
import { natureWardTargetForImage } from "./natureWardGeometry";
import type {
  Action,
  State,
  CombatView,
  Unit,
} from "../../../packages/engine/index";
import type { Assets } from "./assets";
import { warmActors, type ActorCue } from "./ActorSprite";
import { FIRE_DEATH_MS } from "./FireDeathEffect";
import { sfx } from "./sound";
import { warmHeroClip } from "./Hero";
import { HERO_VIEW, heroSourcePoint } from "./heroGeometry";
import { summonArt } from "./warbandLayout";
import type { Point, SpellEffect, SpellKind } from "./SpellEffects";
type Float = { id: number; point: Point; label: string; cause?: "scorch" };
export function useBattleDirector(
  assets: Assets,
  animate: (name: string) => void,
  show: (view: CombatView) => void,
) {
  const [cues, setCues] = useState<Record<string, ActorCue>>({}),
    [effects, setEffects] = useState<SpellEffect[]>([]),
    [numbers, setNumbers] = useState<Float[]>([]),
    [ghosts, setGhosts] = useState<Unit[]>([]),
    [label, setLabel] = useState("");
  const [husks, setHusks] = useState<{id:number;src:string;style:{left:string;top:string;width:string;height:string}}[]>([]);
  const serial = useRef(0),
    version = useRef(0),
    motions = useRef<Animation[]>([]);
  const actor = (id: string) =>
    document.querySelector<HTMLElement>(`[data-actor="${id}"]`);
  // Convert screen pixels back into the artwork's coordinate system after HUD zoom.
  const stageScale = () => {
    const arena = document.querySelector<HTMLElement>(".battlefield")!;
    return arena.getBoundingClientRect().width / arena.offsetWidth;
  };
  const point = (id: string, handClip?: string): Point => {
    const arena = document
      .querySelector(".battlefield")!
      .getBoundingClientRect();
    const element =
      id === "hero"
        ? actor(id)?.querySelector(".hero-canvas canvas")
        : actor(id)?.querySelector(".actor-sprite");
    const box = element?.getBoundingClientRect();
    const scale = stageScale();
    if (!box) return { x: arena.width * 0.48 / scale, y: arena.height * 0.7 / scale };
    const clip = handClip ? assets.animations[handClip] : undefined;
    if (id === "hero" && clip?.releaseOrigin) {
      const socket = heroSourcePoint(clip, clip.releaseOrigin);
      return {
        x: (box.left - arena.left + box.width * socket.x / HERO_VIEW.width) / scale,
        y: (box.top - arena.top + box.height * socket.y / HERO_VIEW.height) / scale,
      };
    }
    return {
      x:
        (box.left -
        arena.left +
        box.width * (id === "hero" ? 0.42 : 0.5)) / scale,
      y:
        (box.top -
        arena.top +
        box.height * (id === "hero" ? 0.43 : 0.5)) / scale,
    };
  };
  const floor = (id: string) => {
    const element =
      id === "hero"
        ? actor(id)?.querySelector(".hero-canvas canvas")
        : actor(id)?.querySelector(".actor-sprite");
    const box = element?.getBoundingClientRect();
    return box
      ? (box.top +
          box.height *
            (id === "hero" ? 0.835 : id.startsWith("enemy") ? 0.88 : 1)) / stageScale()
      : 0;
  };
  const cue = (id: string, state: string) =>
    setCues((current) => ({
      ...current,
      [id]: { state, sequence: ++serial.current },
    }));
  const effect = (
    kind: SpellKind,
    from: Point,
    targets: Point[],
    release = 280,
    travel = 360,
    scale = 1,
    height?: number,
  ) => {
    const e: SpellEffect = {
      id: ++serial.current,
      kind,
      start: performance.now(),
      duration:
        kind === "summon"
          ? 1300
          : kind === "ward" || kind === "nature-ward"
            ? release + 3000
            : kind === "scorch"
              ? 1500
            : kind === "pact" ||
              kind === "kindle" ||
              kind === "ascend"
            ? 1100
            : release + travel + 850,
      release,
      travel,
      from,
      targets,
      scale,
      height,
    };
    setEffects((previous) => [
      ...previous.filter((p) => performance.now() - p.start < p.duration),
      e,
    ]);
  };
  // Center the ward just ahead of the forward silhouette, letting its near edge
  // overlap the unit. Source-scaled bounds also handle packed and flying units.
  const wardUnit = (unit: Unit, from: Point, release: number) => {
    const sprite = actor(`unit-${unit.id}`)?.querySelector<HTMLElement>(".actor-sprite");
    const box = sprite?.querySelector("img")?.getBoundingClientRect();
    const art = assets.actors[summonArt(unit.kind, assets)];
    if (!box || !art) return;
    const arena = document.querySelector(".battlefield")!.getBoundingClientRect(), zoom = stageScale();
    const bounds = art.geometry?.layout_bounds_px ?? [0, 0, ...art.size];
    const top = box.top + box.height * bounds[1] / art.size[1];
    const bottom = box.top + box.height * bounds[3] / art.size[1];
    const right = box.left + box.width * bounds[2] / art.size[0];
    const size = Math.max(.3, Math.min(.7, (bottom - top) / zoom / 260));
    effect("ward", from, [{ x: (right - arena.left) / zoom + 8 * size,
      y: ((top + bottom) / 2 - arena.top) / zoom }], release, 0, size);
  };
  const number = (id: string, amount: number, cause?: "scorch") => {
    const item = {
      id: ++serial.current,
      point: point(id),
      label: cause === "scorch" ? `SCORCH ${amount ? `−${amount}` : "BLOCKED"}` : amount ? `−${amount}` : "BLOCKED",
      cause,
    };
    setNumbers((previous) => [...previous.slice(-8), item]);
  };
  useEffect(
    () => () => {
      version.current++;
      motions.current.forEach((a) => a.cancel());
    },
    [],
  );
  const clear = () => {
    sfx.stop();
    version.current++;
    motions.current.forEach((a) => a.cancel());
    motions.current = [];
    setEffects([]);
    setHusks([]);
    setNumbers([]);
    setGhosts([]);
    setCues({});
    setLabel("");
  };
  async function run(before: State, after: State, action: Action) {
    const token = ++version.current;
    let recovery = 0,
      source = "";
    let heroHurtSinceAttack = false;
    let musterIsFire = false;
    let sacrificedActor: number | undefined;
    const pause = async (ms: number) => {
      await new Promise((resolve) => setTimeout(resolve, ms));
      if (token !== version.current) throw Error("Animation cancelled");
    };
    const settle = async () => {
      if (recovery) {
        await pause(recovery);
        recovery = 0;
      }
    };
    setGhosts([]);
    setNumbers([]);
    setLabel(action.type === "end" ? "Muster phase…" : "Preparing spell…");
    const card =
      action.type === "play"
        ? before.hand.find((c) => c.uid === action.uid)?.id
        : undefined;
    const clip = (card?.startsWith("summon") || card === "empower-demon")
      ? "summon_demon"
      : ["blood-pact", "feed-the-pit", "dark-bargain", "sacrificial-rite", "unholy-frenzy", "fiendish-feast"].includes(card ?? "")
        ? "blood_pact"
        : card && cards[card].type === "Attack"
          ? before.demonTurns
            ? "empowered_attack"
            : "firebolt"
          : "guard_enter";
    await Promise.all([
      warmActors(assets, [before, after, ...after.events.flatMap(event => event.view ? [event.view] : [])].flatMap(view => [
        ...view.units.map(unit => summonArt(unit.kind, assets)),
        ...view.enemies.map(enemy => enemy.art),
      ])),
      warmHeroClip(assets, clip),
      warmHeroClip(assets, "hit_light"),
      warmHeroClip(assets, "guard_impact"),
    ]);
    if (token !== version.current) return;
    if (action.type === "item") {
      sfx.play(`item-${action.item}`, 0, -.2);
      const hand=point("hero", "guard_enter");
      const itemRelease = assets.animations.guard_enter.events?.find(e => e.name === "cast-release")?.time_ms ?? 450;
      animate("guard_enter");
      if (action.item === "shrapnel-jar") {
        source="card";
        effect("conflagrate", hand, before.enemies.filter(e=>e.hp>0).map(e=>point(`enemy-${e.id}`)), itemRelease, 300);
        await pause(itemRelease + 300);
      } else if (["barkskin-tonic", "banner-draught"].includes(action.item)) {
        effect("ward", hand, [{x:hand.x+55,y:hand.y+60}], itemRelease, 0);
        for (const unit of before.units) if ((after.units.find(u => u.id === unit.id)?.guard ?? 0) > unit.guard)
          wardUnit(unit, hand, itemRelease);
        await pause(itemRelease);
      } else {
        effect("kindle", hand, [point("hero")], itemRelease, 0);
        await pause(200);
      }
    }
    for (const event of after.events) {
      if (
        [
          "card",
          "muster",
          "transform",
          "passive",
          "reserve",
          "enemy-summon",
          "boss-phase",
          "enemy-shield",
          "enemy",
          "ascend",
          "victory",
          "defeat",
          "turn",
        ].includes(event.type)
      )
        await settle();
      if (event.type === "card" && card) {
        sfx.play("card-play");
        source = "card";
        setLabel(cards[card].name);
        if (event.view) show(event.view);
        animate(clip);
        const release = Math.max(
            0,
            assets.animations[clip].events?.find(e => ["impact", "release", "cast-release"].includes(e.name))?.time_ms ?? 300,
          ),
          all = ["conflagrate", "ashen-ward", "hellfire", "ember-storm", "smoke-and-mirrors"].includes(card);
        const summonSound = card.startsWith("summon-")
          ? ["summon-hellhound", "summon-cerberax"].includes(card) ? "summon-hellhound"
            : ["summon-pit-brute", "summon-gorthak", "summon-pyre-warden", "summon-pyre-colossus"].includes(card) ? "summon-pit-brute" : "summon-imp"
          : card === "empower-demon" ? "ascend" : card;
        sfx.play(summonSound, release / 1000, -.15);
        const targetIds = all
          ? before.enemies.filter((e) => e.hp > 0).map((e) => e.id)
          : [event.target!];
        const targets = targetIds.map((id) => point(`enemy-${id}`)),
          hand = point("hero", clip);
        for (const unit of before.units) if ((after.units.find(u => u.id === unit.id)?.guard ?? 0) > unit.guard)
          wardUnit(unit, hand, release);
        if (card.startsWith("summon") || card === "empower-demon") {
          await pause(release);
        } else if (["sacrificial-rite", "fiendish-feast", "hellish-command", "feast-of-embers"].includes(card) && action.type === "play" && action.unit !== undefined) {
          const id = `unit-${action.unit}`, center = point(id);
          const sprite = actor(id)?.querySelector<HTMLElement>(".actor-sprite");
          const height = (sprite?.getBoundingClientRect().height ?? 150) / stageScale();
          await pause(release);
          const sacrifice = card === "sacrificial-rite" || card === "fiendish-feast";
          const duration = sacrifice ? 1700 : card === "hellish-command" ? 850 : 1500;
          const kind: SpellKind = sacrifice ? card === "sacrificial-rite" ? "sacrifice-rite" : "sacrifice-feast" : card === "hellish-command" ? "command" : "ember-feast";
          setEffects(previous => [...previous.filter(e => performance.now()-e.start < e.duration), {
            id:++serial.current,kind,start:performance.now(),duration,release:0,travel:0,
            from:sacrifice ? center : hand,targets:[sacrifice ? point("hero") : center],height,
          }]);
          if (sprite) motions.current.push(sprite.animate(sacrifice ? [
            {opacity:1,filter:"brightness(1)",clipPath:"inset(0% 0% 0% 0%)"},
            {opacity:1,filter:"brightness(1.8) sepia(1) saturate(8) hue-rotate(320deg) drop-shadow(0 0 12px #ff170c)",clipPath:"inset(0% 0% 0% 0%)",offset:.18},
            {opacity:.6,filter:"brightness(2) sepia(1) saturate(10) hue-rotate(320deg) drop-shadow(0 0 16px #ed120c)",clipPath:"inset(0% 0% 65% 0%)",offset:.48},
            {opacity:0,filter:"brightness(4)",clipPath:"inset(0% 0% 100% 0%)",offset:.7},
            {opacity:0,clipPath:"inset(0% 0% 100% 0%)"},
          ] : [
            {filter:"brightness(1)"},
            {filter:card === "hellish-command" ? "brightness(1.5) drop-shadow(0 0 16px #ff1808)" : "brightness(1.4) drop-shadow(0 0 18px #f51c12)",offset:.5},
            {filter:"brightness(1)"},
          ], {duration,easing:"ease-in-out",fill:sacrifice ? "forwards" : "none"}));
          if (sacrifice) sacrificedActor = action.unit;
          await pause(duration);
          if (card === "feast-of-embers") {
            const old = before.units.find(u => u.id === action.unit), next = after.units.find(u => u.id === action.unit);
            if (old && next) setNumbers(previous => [...previous.slice(-8), {id:++serial.current,point:center,label:`${next.hp > old.hp ? `+${next.hp-old.hp} HP � ` : ""}+${next.power-old.power} Power`}]);
          } else if (card === "fiendish-feast" && after.hp > before.hp) {
            setNumbers(previous => [...previous.slice(-8), {id:++serial.current,point:point("hero"),label:`+${after.hp-before.hp} HP`}]);
          }
        } else if (cards[card].type === "Attack") {
          const kind: SpellKind =
            ["searing-lash", "infernal-whip", "rend-flesh", "ritual-cut"].includes(card)
              ? "lash"
              : card === "immolate" || card === "smoldering-brand"
                ? "immolate"
                : ["conflagrate", "hellfire", "combust"].includes(card)
                  ? "conflagrate"
                  : "fire";
          effect(
            kind,
            hand,
            targets,
            release,
            340,
            before.demonTurns ? 1.3 : 1,
          );
          await pause(release + 340);
          recovery = 350;
        } else if (["blood-pact", "feed-the-pit", "dark-bargain", "sacrificial-rite", "unholy-frenzy", "fiendish-feast"].includes(card ?? "")) {
          effect("pact", hand, [point("hero")], release, 0);
          await pause(release);
          recovery = 450;
        } else if (card === "kindle") {
          effect("kindle", hand, [], release, 0);
          await pause(release);
          recovery = 400;
        } else if (cards[card].type === "Power" || ["infernal-transformation", "abyssal-gaze", "hellish-command", "feast-of-embers"].includes(card)) {
          effect("pact", hand, [point("hero")], release, 0);
          await pause(release); recovery = 400;
        } else if (["ember-storm", "void-gaze", "corrupting-touch"].includes(card)) {
          effect("immolate", hand, targets, release, 340);
          await pause(release + 340); recovery = 350;
        } else {
          effect(
            "ward",
            hand,
            [
              { x: hand.x + 55, y: hand.y + 60 },
            ],
            release,
            0,
          );
          if (card === "ashen-ward")
            effect("immolate", hand, targets, release, 340, 0.65);
          await pause(card === "ashen-ward" ? release + 340 : release);
          recovery = 450;
        }
        continue;
      }
      if (event.type === "muster") {
        source = "muster";
        setLabel(event.message);
        const id = `unit-${event.actor}`,
          unit =
            event.view?.units.find((u) => u.id === event.actor) ||
            after.units.find((u) => u.id === event.actor),
          target = point(`enemy-${event.target}`);
        musterIsFire = unit?.kind === "imp" || unit?.kind === "ignivar";
        const allTargets = (event.targets?.filter(t => t !== "hero") ?? [event.target!]).map(t => point(`enemy-${t}`));
        const attack = unit ? assets.actors[summonArt(unit.kind, assets)]?.states.attack : undefined;
        const impact = attack?.impact ?? 100;
        if (musterIsFire) {
          sfx.play("attack-imp", impact / 1000);
          cue(id, "attack");
          effect("fire", point(id), allTargets, impact, 240, unit?.kind === "ignivar" ? .9 : .58);
          await pause(impact + 240);
          recovery = Math.max(0, (attack?.duration ?? 350) - impact - 240);
        } else if (unit && ["gloomstalker", "nightmaw", "soul-leech", "hollow-saint", "pyre-warden", "pyre-colossus"].includes(unit.kind)) {
          cue(id, "attack");
          const support = ["pyre-warden", "pyre-colossus"].includes(unit.kind);
          sfx.play(support ? "ward-of-ash" : "dark-bargain", impact / 1000);
          effect(support ? "immolate" : "pact", point(id), allTargets, impact, 280, .8);
          await pause(impact + 280);
          recovery = Math.max(280, (attack?.duration ?? 600) - impact - 280);
        } else {
          const image = actor(id)?.querySelector<HTMLElement>(".actor-sprite");
          const travelDuration = Math.max(700, 280 + (attack?.duration ?? 350));
          if (image) {
            const from = point(id),
              dx = target.x - from.x - 60,
              dy = floor(`enemy-${event.target}`) - floor(id);
            motions.current.push(
              image.animate(
                [
                  { transform: "translate(0,0)" },
                  { transform: `translate(${dx}px,${dy}px)`, offset: 280 / travelDuration },
                  {
                    transform: `translate(${dx + 12}px,${dy}px)`,
                    offset: (280 + impact) / travelDuration,
                  },
                  { transform: "translate(0,0)" },
                ],
                { duration: travelDuration, easing: "ease-in-out" },
              ),
            );
          }
          await pause(280);
          if (unit) sfx.play(["hellhound", "cerberax"].includes(unit.kind) ? "attack-hellhound" : "attack-pit-brute");
          cue(id, "attack");
          await pause(impact);
          effect("impact", target, allTargets, 0, 0);
          recovery = travelDuration - 280 - impact;
        }
      }
      if (event.type === "enemy") {
        heroHurtSinceAttack = false;
        source = "enemy";
        setLabel(event.message);
        const enemy = event.view?.enemies.find((e) => e.id === event.actor) ?? before.enemies.find((e) => e.id === event.actor)! ,
          id = `enemy-${event.actor}`,
          targets = (event.targets || ["hero"]).map((t) =>
            t === "hero" ? "hero" : `unit-${t}`,
          ),
          destination = point(targets[0] ?? "hero");
        if (!enemy) continue;
        if (event.targets?.length === 0) {
          cue(id, "cast");
          if(event.view) show(event.view);
          await pause(360);
          continue;
        }
        const from = point(id),
          image = actor(id)?.querySelector<HTMLElement>(".actor-sprite"),
          parent = actor(id);
        if (parent) parent.style.zIndex = "20";
        const ranged = assets.actors[enemy.art].ranged;
        if (image && !ranged) {
          const dx = destination.x - from.x + 70,
            dy = floor(targets[0]) - floor(id);
          motions.current.push(
            image.animate(
              [
                { transform: "translate(0,0)" },
                { transform: `translate(${dx}px,${dy}px)`, offset: 0.29 },
                { transform: `translate(${dx - 16}px,${dy}px)`, offset: 0.49 },
                { transform: `translate(${dx}px,${dy}px)`, offset: 0.65 },
                { transform: "translate(0,0)" },
              ],
              { duration: 900, easing: "ease-in-out" },
            ),
          );
        }
        if (!ranged) await pause(260);
        sfx.play(`enemy-${enemy.art}`, 0, .25);
        cue(id, "attack");
        const impact = assets.actors[enemy.art].states.attack.impact ?? 150;
        await pause(impact);
        if (ranged) {
          const bounds=image?.querySelector("img")?.getBoundingClientRect();
          const arena=document.querySelector(".battlefield")!.getBoundingClientRect();
          const zoom=stageScale();
          const origin=bounds?{x:(bounds.left+bounds.width*ranged.origin[0]-arena.left)/zoom,y:(bounds.top+bounds.height*ranged.origin[1]-arena.top)/zoom}:from;
          effect(ranged.kind,origin,targets.map(t=>point(t)),0,ranged.travelMs,enemy.boss ? 1.8 : 1);
          if(enemy.boss) effect("conflagrate",origin,targets.map(t=>point(t)),100,ranged.travelMs,1.25);
          await pause(ranged.travelMs);
        }
        effect(
          "impact",
          destination,
          targets.map((id) => point(id)),
          0,
          0,
        );
        if (targets.includes("hero")) animate((event.view?.guard??0)>=(event.amount??0)?"guard_impact":"hit_light");
        for (const t of targets.filter((t) => t !== "hero")) cue(t, "hit");
        recovery = ranged ? Math.max(180,assets.actors[enemy.art].states.attack.duration-impact-ranged.travelMs) : Math.max(0,900 - 260 - impact);
      }
      if (event.type === "enemy-summon") {
        if (event.view) show(event.view);
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        if (token !== version.current) return;
        const id = `enemy-${event.actor}`;
        cue(`enemy-${event.target}`, "summon");
        cue(id, "spawn");
        setLabel(event.message);
        sfx.play("boss-summon", 0, .3);
        const element = actor(id), box = element?.querySelector(".actor-sprite")?.getBoundingClientRect();
        const arena = document.querySelector(".battlefield")!.getBoundingClientRect(), zoom = stageScale();
        if (box) effect("summon", point(`enemy-${event.target}`), [{x:(box.left+box.width*.5-arena.left)/zoom,y:(box.top+box.height*.88-arena.top)/zoom}], 80, 0, 1.15, box.height/zoom);
        if (element) motions.current.push(element.animate([{opacity:0,filter:"brightness(3)"},{opacity:1,filter:"brightness(1)"}],{duration:1050,easing:"ease-out"}));
        recovery = 1300;
      }
      if (event.type === "enemy-shield") {
        const id = `enemy-${event.actor}`, center = point(id);
        cue(id, "cast"); setLabel(event.message); sfx.play("boss-shield",0,.3);
        const enemy = event.view?.enemies.find(e => e.id === event.actor) ?? before.enemies.find(e => e.id === event.actor);
        if (enemy && (FOREST_ENEMY_IDS as readonly string[]).includes(enemy.art)) {
          const sprite = actor(id)?.querySelector(".actor-sprite img");
          const arena = document.querySelector(".battlefield")!;
          if (sprite) {
            const target = natureWardTargetForImage(enemy.art,sprite.getBoundingClientRect(),arena.getBoundingClientRect(),stageScale());
            effect("nature-ward",center,[target],100,0,1);
          }
        } else effect("ward",center,[{x:center.x-55,y:center.y+20}],100,0,1.5);
        recovery = 650;
      }
      if (event.type === "boss-phase") {
        const id = `enemy-${event.actor}`, center = point(id);
        if(event.view)show(event.view);
        cue(id,"cast"); setLabel(event.message); sfx.play("boss-phase",0,.25);
        effect("ascend",center,[],100,0,2.2);
        effect("conflagrate",center,[center],120,200,2);
        recovery = 1250;
      }
      if (event.type === "damage" && event.target !== undefined) {
        const target = event.view?.enemies.find(e => e.id === event.target) ?? before.enemies.find(e => e.id === event.target);
        const burning = event.cause === "scorch";
        if (burning) {
          // Scorch resolves after this enemy's attack. Finish its lunge first,
          // then give the burn its own lead-in and readable damage hold.
          await settle();
          source = "scorch";
          setLabel(`Scorch · ${target?.name ?? "Enemy"} · ${event.amount ? `${event.amount} damage` : "blocked by Guard"}`);
          effect("scorch", point(`enemy-${event.target}`), [point(`enemy-${event.target}`)], 0, 0);
          await pause(300);
        }
        sfx.play(!event.amount ? "hit-block" : burning || source === "card" || source === "enemy" || (source === "muster" && musterIsFire) ? "hit-fire" : target && ["goblin","skirmisher","tollbell","furnace-beetle"].includes(target.art) ? "hit-armor" : "hit-flesh", 0, .25);
        cue(`enemy-${event.target}`, "hit");
        number(`enemy-${event.target}`, event.amount || 0, burning ? "scorch" : undefined);
        if (burning) recovery = Math.max(recovery, 1450);
      }
      if (event.type === "hurt") { if ((event.amount || 0) > 0) { animate("hit_light"); recovery = Math.max(recovery, assets.animations.hit_light.duration); } heroHurtSinceAttack = true; sfx.play("hit-flesh", 0, -.35); number("hero", event.amount || 0); }
      if (event.type === "enemy-impact" && event.targets?.includes("hero") && !heroHurtSinceAttack) sfx.play("hit-block", 0, -.35);
      if (event.type === "unit-hit" && event.target !== undefined) {
        const unit = before.units.find(u => u.id === event.target);
        sfx.play(!event.amount ? "hit-block" : unit?.kind === "pit-brute" ? "hit-armor" : "hit-flesh");
        cue(`unit-${event.target}`, "hit");
        number(`unit-${event.target}`, event.amount || 0);
      }
      if (event.type === "reserve") {
        // The boundary above settles the entire death clip and fire burst first.
        const snapshots = [...document.querySelectorAll<HTMLImageElement>(".fire-death-husk")].map(img => ({
          id: ++serial.current, src: img.src,
          style: {left:img.style.left,top:img.style.top,width:img.style.width,height:img.style.height},
        }));
        setHusks(previous => {
          const result=[...previous];
          for(const h of snapshots) if(!result.some(x=>x.src===h.src&&x.style.left===h.style.left&&x.style.top===h.style.top))result.push(h);
          return result;
        });
        if(event.view)show(event.view);
        setLabel(event.message);
        await pause(40);
        const newcomer = actor(`enemy-${event.actor}`);
        if(newcomer)motions.current.push(newcomer.animate([{opacity:0,transform:"translateX(36px)"},{opacity:1,transform:"translateX(0)"}],{duration:550,easing:"ease-out"}));
        recovery=550;
      }
      if (event.type === "transform") {
        const id = `unit-${event.actor}`;
        const prior = before.units.find(u => u.id === event.actor);
        const oldSprite = actor(id)?.querySelector<HTMLElement>(".actor-sprite");
        const oldBox = oldSprite?.getBoundingClientRect();
        const sourceWorldUnit = oldSprite ? parseFloat(getComputedStyle(oldSprite).getPropertyValue("--summon-world-unit")) || 200 : 200;
        setLabel(event.message);
        sfx.play("ascend");
        const start = performance.now();
        // Commit the new layout synchronously so its old-root offset is applied
        // before the browser can paint a frame in the destination slot.
        flushSync(() => {
          setCues(current => ({...current, [id]: {state:"empower", sequence:++serial.current, fromArt:prior ? summonArt(prior.kind, assets) : undefined, startedAt:start, sourceWorldUnit}}));
          if (event.view) show(event.view);
        });
        const element = actor(id), sprite = element?.querySelector<HTMLElement>(".actor-sprite");
        const box = sprite?.getBoundingClientRect();
        if (box && oldBox && element) {
          const zoom = stageScale();
          // Keep the ritual rooted at the sacrifice, then carry it into the new
          // formation slot (including transformations between air and ground).
          motions.current.push(element.animate([
            {translate:`${(oldBox.left + oldBox.width/2 - box.left - box.width/2)/zoom}px ${(oldBox.bottom-box.bottom)/zoom}px`,offset:0},
            {translate:`${(oldBox.left + oldBox.width/2 - box.left - box.width/2)/zoom}px ${(oldBox.bottom-box.bottom)/zoom}px`,offset:.18},
            {translate:"0px 0px",offset:1},
          ], {duration:1500,easing:"ease-in-out"}));
        }
        const arena = document.querySelector(".battlefield")!.getBoundingClientRect(), zoom = stageScale();
        const root = box ? {x:(box.left+box.width/2-arena.left)/zoom,y:(box.bottom-arena.top)/zoom} : point(id);
        setEffects(previous => [...previous.filter(e => start-e.start < e.duration), {
          id:++serial.current,kind:"empower",start,duration:EMPOWER_MS,release:0,travel:0,
          from:root,targets:[root],scale:Math.max(.85,Math.min(1.65,(box?.width ?? 150)/zoom/150)),
          height:Math.max(260,(box?.height ?? 170)/zoom*1.8),targetActor:id,
        }]);
        // Complete the reveal before passive/cast cues can replace the silhouette.
        await pause(Math.max(0, EMPOWER_MS - (performance.now()-start)));
        cue(id,"idle");
        continue;
      }
      if (event.type === "passive") {
        setLabel(event.message);
        const origin = event.actor ? point(`unit-${event.actor}`) : point("hero");
        if (event.actor) cue(`unit-${event.actor}`, "cast");
        effect("pact", origin, [point("hero")], 0, 180, .6);
        recovery = 300;
      }
      if (event.type === "guard") {
        setLabel(event.message);
        const center = point("hero");
        effect("ward", center, [{x:center.x+55,y:center.y+20}], 0, 0, .8);
        sfx.play("ward-of-ash");
        recovery = Math.max(recovery, 320);
      }
      if (event.type === "heal" && (event.amount ?? 0) > 0) {
        setLabel(event.message);
        effect("kindle", event.actor ? point(`unit-${event.actor}`) : point("hero"), [point("hero")], 0, 220, .8);
        setNumbers(previous => [...previous.slice(-8), {id:++serial.current,point:point("hero"),label:`+${event.amount} HP`}]);
        recovery = Math.max(recovery, 350);
      }
      if (event.type === "summon") {
        cue(`unit-${event.actor}`, "spawn");
        if (event.view) show(event.view);
        // Wait for React layout; measure the actual slot, including packed/flying units.
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        if (token !== version.current) return;
        const sprite = actor(`unit-${event.actor}`)?.querySelector<HTMLElement>(".actor-sprite");
        const box = sprite?.getBoundingClientRect();
        const arena = document.querySelector(".battlefield")!.getBoundingClientRect();
        if (box) {
          const zoom = stageScale();
          const unit = event.view?.units.find(u => u.id === event.actor);
          const width = unit?.kind === "hellhound" ? 1.05 : unit?.kind === "pit-brute" ? 1.25 : .7;
          const worldUnit = parseFloat(getComputedStyle(sprite!).getPropertyValue("--summon-world-unit")) || 200;
          const size = worldUnit / (unit?.kind === "hellhound" ? 225.8064515 : 200);
          effect("summon", point("hero", clip), [{x:(box.left+box.width/2-arena.left)/zoom,y:(box.bottom-arena.top)/zoom}], 160, 0, width * size, box.height/zoom);
          const guarded = after.units.find(u => u.id === event.actor);
          if (guarded && guarded.guard > 0) wardUnit(guarded, point("hero", clip), 900);
        }
        recovery = Math.max(recovery, 1300);
      }
      if (event.type === "kill") {
        cue(`enemy-${event.target}`, "die");
        const enemy = (event.view?.enemies ?? before.enemies).find((e) => e.id === event.target);
        recovery = Math.max(
          recovery,
            enemy ? assets.actors[enemy.art].states.die.duration + (assets.actors[enemy.art].deathEffect === "fire" ? FIRE_DEATH_MS : 0) : 800,
        );
      }
      if (event.type === "unit-death" && event.unit && event.actor !== sacrificedActor) {
        setGhosts((previous) => [...previous, { ...event.unit!, hp: 0 }]);
        cue(`unit-${event.actor}`, "die");
        recovery = Math.max(recovery, assets.actors[summonArt(event.unit.kind, assets)]?.states.die.duration ?? 740);
      }
      if (event.type === "ascend") {
        sfx.play("ascend");
        animate("empowered_idle");
        effect("ascend", point("hero"), [], 300, 0);
        await pause(650);
      }
      if (event.type === "victory") {
        animate("victory");
        await pause(800);
      }
      if (event.type === "defeat") {
        animate("die");
        await pause(1500);
      }
      if (event.view) show(event.view);
    }
    await settle();
    if (token === version.current) {
      setGhosts([]);
      setLabel("");
      for (const e of document.querySelectorAll<HTMLElement>('[data-actor^="enemy-"]'))
        e.style.zIndex = "";
    }
  }
  return { cues, effects, numbers, ghosts, husks, label, run, clear };
}
