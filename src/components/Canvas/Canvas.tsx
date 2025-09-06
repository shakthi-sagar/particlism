import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import styles from "./Canvas.module.scss";

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

    const rule = (atoms1: Atom[], atoms2: Atom[], g: number) => {
        if (canvasRef.current) {
            for (let i = 0; i < atoms1.length; i++) {
                let fx = 0;
                let fy = 0;
                for (let j = 0; j < atoms2.length; j++) {
                    const a = atoms1[i];
                    const b = atoms2[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d > 0 && d < 80) {
                        // Physics: positive g = attraction, negative g = repulsion
                        const F = (g * 1) / d;
                        // dx = a.x - b.x is vector from b to a
                        // For attraction (positive g): force should pull a towards b (opposite direction)
                        // For repulsion (negative g): force should push a away from b (same direction)
                        fx += F * (-dx); // Flip direction for correct physics
                        fy += F * (-dy);
                    }
                }
                atoms1[i].vx = (atoms1[i].vx + fx) * 0.5;
                atoms1[i].vy = (atoms1[i].vy + fy) * 0.5;
                atoms1[i].x += atoms1[i].vx;
                atoms1[i].y += atoms1[i].vy;

                // Boundary collision detection
                if (atoms1[i].x <= 0 || atoms1[i].x >= width) { atoms1[i].vx *= -1; }
                if (atoms1[i].y <= 0 || atoms1[i].y >= height) { atoms1[i].vy *= -1; }
            }
        }
    }

    // Initialize atoms when colorsConfig changes
    useEffect(() => {
        resetSimulation();
    }, [colorsConfig]);

    // Main simulation loop
    useEffect(() => {
        if (!isRunning || atoms.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const update = () => {
            if (!isRunning) return;

            // Group atoms by color for efficiency
            const atomsByColor = colorsConfig.reduce((acc, config) => {
                acc[config.color] = atoms.filter(atom => atom.color === config.color);
                return acc;
            }, {} as Record<string, Atom[]>);

            // Update physics for each color pair (including self-attraction)
            colorsConfig.forEach(config1 => {
                colorsConfig.forEach(config2 => {
                    const atoms1 = atomsByColor[config1.color];
                    const atoms2 = atomsByColor[config2.color];
                    const attraction = config1.attractions[config2.color] || 0;
                    if (atoms1 && atoms2) {
                        rule(atoms1, atoms2, attraction);
                    }
                });
            });

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
        </div>
    );
};

export default Canvas;
