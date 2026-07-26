export const PARTICLE_COLORS = [
    "#ff1744", "#00e676", "#ffea00", "#2979ff", "#ff9100",
    "#d500f9", "#00e5ff", "#f500a0", "#76ff03", "#ffffff"
];

export const randomForce = () => Math.random() * 2 - 1;

export const randomColor = (used: string[] = []) => {
    const available = PARTICLE_COLORS.filter(color => !used.includes(color));
    const colors = available.length ? available : PARTICLE_COLORS;
    return colors[Math.floor(Math.random() * colors.length)];
};
