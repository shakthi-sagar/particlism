import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react";
import { randomColor, randomForce } from "@/particleConfig";
import styles from "./Canvas.module.scss";

const MIN_DISTANCE = 8;
const MAX_SPEED = 3;
const INTERACTION_DISTANCE = 80;

interface ColorConfig {
    color: string;
    number: number;
    attractions: { [key: string]: number };
}

interface CanvasProps {
    width: number;
    height: number;
    colorsConfig: ColorConfig[];
    setColorsConfig: (config: ColorConfig[]) => void;
}

interface Atom {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
}

const Canvas: React.FC<CanvasProps> = ({ width, height, colorsConfig, setColorsConfig }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [atoms, setAtoms] = useState<Atom[]>([]);
    const [isRunning, setIsRunning] = useState(true);
    const animationRef = useRef<number>();

    const createAtoms = (number: number, color: string) => {
        const newAtoms: Atom[] = [];
        for (let i = 0; i < number; i++) {
            newAtoms.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: 0,
                vy: 0,
                color
            });
        }
        return newAtoms;
    }

    const resetSimulation = () => {
        const newAtoms: Atom[] = [];
        colorsConfig.forEach(config => {
            const configAtoms = createAtoms(config.number, config.color);
            newAtoms.push(...configAtoms);
        });
        setAtoms(newAtoms);
    }

    const buildGrid = () => {
        // ponytail: uniform grid can degrade in one huge cluster; use a quadtree if that becomes measurable.
        const grid = new Map<string, number[]>();
        atoms.forEach((atom, index) => {
            const key = `${Math.floor(atom.x / INTERACTION_DISTANCE)},${Math.floor(atom.y / INTERACTION_DISTANCE)}`;
            const cell = grid.get(key);
            if (cell) cell.push(index);
            else grid.set(key, [index]);
        });
        return grid;
    };

    const nearbyCellKeys = (atom: Atom) => {
        const columns = Math.max(1, Math.ceil(width / INTERACTION_DISTANCE));
        const rows = Math.max(1, Math.ceil(height / INTERACTION_DISTANCE));
        const cellX = Math.floor(atom.x / INTERACTION_DISTANCE);
        const cellY = Math.floor(atom.y / INTERACTION_DISTANCE);
        const keys = new Set<string>();

        for (let x = cellX - 1; x <= cellX + 1; x++) {
            for (let y = cellY - 1; y <= cellY + 1; y++) {
                keys.add(`${(x % columns + columns) % columns},${(y % rows + rows) % rows}`);
            }
        }
        return Array.from(keys);
    };

    const applyForces = (grid: Map<string, number[]>) => {
        const configs = Object.fromEntries(colorsConfig.map(config => [config.color, config]));

        atoms.forEach((atom, index) => {
            let fx = 0;
            let fy = 0;

            for (const key of nearbyCellKeys(atom)) {
                    for (const otherIndex of grid.get(key) || []) {
                        if (otherIndex === index) continue;
                        const other = atoms[otherIndex];
                        let dx = atom.x - other.x;
                        let dy = atom.y - other.y;
                        dx -= Math.round(dx / width) * width;
                        dy -= Math.round(dy / height) * height;
                        const distance = Math.hypot(dx, dy);
                        if (distance === 0 || distance >= INTERACTION_DISTANCE) continue;

                        const attraction = configs[atom.color]?.attractions[other.color] || 0;
                        const force = distance < MIN_DISTANCE ? -1 : attraction;
                        fx -= force * dx / distance;
                        fy -= force * dy / distance;
                    }
            }

            atom.vx += fx;
            atom.vy += fy;
        });
    };

    const moveAtoms = () => {
        atoms.forEach(atom => {
            atom.vx *= 0.5;
            atom.vy *= 0.5;
            const speed = Math.hypot(atom.vx, atom.vy);
            if (speed > MAX_SPEED) {
                atom.vx *= MAX_SPEED / speed;
                atom.vy *= MAX_SPEED / speed;
            }

            atom.x += atom.vx;
            atom.y += atom.vy;
            atom.x = (atom.x % width + width) % width;
            atom.y = (atom.y % height + height) % height;
        });

        const grid = buildGrid();
        for (let i = 0; i < atoms.length; i++) {
            for (const key of nearbyCellKeys(atoms[i])) {
                    for (const j of grid.get(key) || []) {
                        if (j <= i) continue;
                let dx = atoms[j].x - atoms[i].x;
                let dy = atoms[j].y - atoms[i].y;
                dx -= Math.round(dx / width) * width;
                dy -= Math.round(dy / height) * height;
                let distance = Math.hypot(dx, dy);
                if (distance >= MIN_DISTANCE) continue;
                if (distance === 0) {
                    dx = 1;
                    dy = 0;
                    distance = 1;
                }

                const correction = (MIN_DISTANCE - distance) / (2 * distance);
                atoms[i].x -= dx * correction;
                atoms[i].y -= dy * correction;
                atoms[j].x += dx * correction;
                atoms[j].y += dy * correction;
                    }
            }
        }
        atoms.forEach(atom => {
            atom.x = (atom.x % width + width) % width;
            atom.y = (atom.y % height + height) % height;
        });
    };

    // Initialize atoms when colorsConfig changes
    useEffect(() => {
        if (width <= 0 || height <= 0) return;
        resetSimulation();
    }, [colorsConfig, width, height]);

    // Main simulation loop
    useEffect(() => {
        if (!isRunning || atoms.length === 0 || width <= 0 || height <= 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const update = () => {
            if (!isRunning) return;

            applyForces(buildGrid());
            moveAtoms();

            // Clear and redraw
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, width, height);

            // Draw all atoms
            atoms.forEach(atom => {
                ctx.fillStyle = atom.color;
                ctx.beginPath();
                ctx.arc(atom.x, atom.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            });

            animationRef.current = requestAnimationFrame(update);
        };

        animationRef.current = requestAnimationFrame(update);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [width, height, atoms, isRunning, colorsConfig]);

    const toggleSimulation = () => {
        setIsRunning(!isRunning);
    };

    const randomize = () => {
        const colors: string[] = [];
        while (colors.length < colorsConfig.length) colors.push(randomColor(colors));

        setColorsConfig(colors.map((color, index) => ({
            color,
            number: colorsConfig[index].number,
            attractions: Object.fromEntries(colors.map(otherColor => [otherColor, randomForce()]))
        })));
    };

    return (
        <div className={styles['canvas-container']}>
            <canvas className={styles['canvas']} ref={canvasRef} width={width} height={height}/>
            <div className={styles['controls']}>
                <button 
                    className={styles['control-button']} 
                    onClick={toggleSimulation}
                    title={isRunning ? 'Pause simulation' : 'Resume simulation'}
                >
                    {isRunning ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button 
                    className={styles['control-button']} 
                    onClick={resetSimulation}
                    title="Reset simulation"
                >
                    <RotateCcw size={18} />
                </button>
            </div>
            <button className={styles['randomize-button']} onClick={randomize}>
                <Shuffle size={16} />
                Randomize
            </button>
        </div>
    );
};

export default Canvas;
