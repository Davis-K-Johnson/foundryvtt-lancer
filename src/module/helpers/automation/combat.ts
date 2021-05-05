import { LancerActionManager } from "../../action/actionManager";
import { LANCER } from "../../config";
import { prepareChargeMacro } from "../../macros";

export async function handleCombatUpdate(combat: any, changed: any) {
  //if (combat.round === 0 || changed?.round === 0) return;
  if (!("turn" in changed) && changed.round !== 1) return;
  if ((game.combats.get(combat.id).data as any).combatants.length == 0) return;

  if (game.settings.get(LANCER.sys_name, LANCER.setting_automation)) {
    const nextTurnIndex = changed.turn;
    const turnIndex = combat.current.turn;
    if (combat.turns[nextTurnIndex]) {
      const nextToken = canvas.tokens.get(combat.turns[nextTurnIndex].tokenId);
      const prevToken = canvas.tokens.get(combat.turns[turnIndex].tokenId);

      // Handle next turn.
      if (nextToken) {
        console.log(`Processing combat automation for ${nextToken.actor._id}`);

        // Handle NPC charges.
        prepareChargeMacro(nextToken.actor._id);

        // Refresh actions.
        console.log(`Next up! Refreshing [${nextToken.actor.data.name}]!`);
        (game.action_manager as LancerActionManager).modAction(nextToken.actor, false);
      }

      // Handle end-of-turn.
      if (prevToken) {
        // Dump extra actions.
        console.log(
          `Turn over! [${prevToken.actor.data.name}] ended turn with ${JSON.stringify(
            prevToken.actor.data.data.actions
          )}`
        );
        (game.action_manager as LancerActionManager).modAction(prevToken.actor, true);
      }
    }
  }
}
