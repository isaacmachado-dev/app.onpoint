import confetti from "canvas-confetti";

/**
 * Batidas 1, 2 e 3:
 * Mini explosão de gotas/partículas azuis (#25586A e #ACEBF0) ao redor do círculo central.
 */
export function triggerWaterSplashConfetti() {
  confetti({
    particleCount: 40,
    spread: 70,
    startVelocity: 22,
    origin: { x: 0.5, y: 0.45 },
    colors: ["#25586A", "#ACEBF0", "#E4F6FB", "#1B4352", "#7CD4DE"],
    shapes: ["circle"],
    ticks: 140,
    gravity: 1.1,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
}

/**
 * 4ª e última batida do dia:
 * Grande celebração com confetes e estrelas douradas na tela inteira.
 */
export function triggerFinalCelebrationConfetti() {
  // Canhão da esquerda
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 70,
    origin: { x: 0.15, y: 0.65 },
    colors: ["#FFD700", "#FFA500", "#25586A", "#ACEBF0", "#FFFFFF"],
    shapes: ["star", "circle"],
    scalar: 1.2,
    ticks: 220,
  });

  // Canhão da direita
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 70,
    origin: { x: 0.85, y: 0.65 },
    colors: ["#FFD700", "#FFA500", "#25586A", "#ACEBF0", "#FFFFFF"],
    shapes: ["star", "circle"],
    scalar: 1.2,
    ticks: 220,
  });

  // Explosão central com estrelas
  setTimeout(() => {
    confetti({
      particleCount: 70,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      colors: ["#FFD700", "#FFC700", "#25586A", "#ACEBF0"],
      shapes: ["star", "circle"],
      scalar: 1.3,
      ticks: 260,
    });
  }, 150);
}

