// Run: node motion.check.mjs   (Node >= 22.18 strips the .ts types natively)
// Asserts control tokens are critically damped (zeta >= 1) and that fast < default < slow.
import assert from "node:assert/strict";
import { spatial, effects, spring, follow } from "./src/lib/motion.ts";

const zeta = ({ stiffness, damping }) => damping / (2 * Math.sqrt(stiffness));

for (const [family, tokens] of Object.entries({ spatial, effects })) {
  for (const [name, s] of Object.entries(tokens)) {
    assert.ok(zeta(s) >= 1 - 1e-9, `${family}.${name} zeta ${zeta(s)} < 1`);
  }
  // Stiffer = faster: fast > default > slow stiffness.
  assert.ok(
    tokens.fast.stiffness > tokens.default.stiffness &&
      tokens.default.stiffness > tokens.slow.stiffness,
    `${family}: expected fast < default < slow settle time`,
  );
}

for (const [name, s] of Object.entries(spring)) {
  assert.ok(zeta(s) >= 1 - 1e-9, `spring.${name} zeta ${zeta(s)} < 1`);
  assert.ok(zeta(s.opacity) >= 1 - 1e-9, `spring.${name}.opacity zeta < 1`);
}

// Followers keep their original numbers; both were already overdamped.
for (const [name, s] of Object.entries(follow)) {
  assert.ok(zeta(s) >= 1, `follow.${name} zeta ${zeta(s)} < 1`);
}

console.log("motion.check: ok");
