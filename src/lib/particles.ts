export interface ColorConfig {
    color: string;
    number: number;
    attractions: Record<string, number>;
}

export const PARTICLE_COLORS = [
    "#ff1744", "#00e676", "#ffea00", "#2979ff", "#ff9100",
    "#d500f9", "#00e5ff", "#f500a0", "#76ff03", "#ffffff"
];

export const randomForce = () => Math.round((Math.random() * 2 - 1) * 100) / 100;

export const randomColor = (used: string[] = []) => {
    const available = PARTICLE_COLORS.filter(color => !used.includes(color));
    const colors = available.length ? available : PARTICLE_COLORS;
    return colors[Math.floor(Math.random() * colors.length)];
};

export const createRandomConfig = (count = 3, numbers: number[] = []): ColorConfig[] => {
    const colors: string[] = [];
    while (colors.length < count) colors.push(randomColor(colors));

    return colors.map((color, index) => ({
        color,
        number: numbers[index] || 200,
        attractions: Object.fromEntries(colors.map(otherColor => [otherColor, randomForce()]))
    }));
};

export const recolorConfig = (configs: ColorConfig[], index: number, color: string): ColorConfig[] => {
    if (configs.some((config, otherIndex) => otherIndex !== index && config.color === color)) return configs;
    const oldColor = configs[index].color;

    return configs.map((config, configIndex) => ({
        ...config,
        color: configIndex === index ? color : config.color,
        attractions: Object.fromEntries(
            Object.entries(config.attractions).map(([target, force]) => [
                target === oldColor ? color : target,
                force
            ])
        )
    }));
};

export const parseConfig = (value: unknown): ColorConfig[] | null => {
    if (!Array.isArray(value) || value.length < 1 || value.length > 10) return null;

    const colors = value.map(item =>
        typeof item === "object" && item !== null && "color" in item ? item.color : null
    );
    if (colors.some(color => typeof color !== "string") || new Set(colors).size !== colors.length) return null;

    return value.every(item => {
        if (typeof item !== "object" || item === null) return false;
        const config = item as Record<string, unknown>;
        const attractions = config.attractions;
        return typeof config.color === "string" &&
            /^#[0-9a-f]{6}$/i.test(config.color) &&
            Number.isInteger(config.number) &&
            (config.number as number) >= 10 &&
            (config.number as number) <= 1000 &&
            typeof attractions === "object" &&
            attractions !== null &&
            colors.every(color => {
                const force = (attractions as Record<string, unknown>)[color as string];
                return typeof force === "number" && Number.isFinite(force) && force >= -1 && force <= 1;
            });
    }) ? value as ColorConfig[] : null;
};
