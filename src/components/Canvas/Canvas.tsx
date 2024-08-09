import React, { useEffect, useRef } from "react";
import styles from "./Canvas.module.scss";

interface CanvasProps {
    width: number;
    height: number;
}

interface Atom {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
}

const Canvas: React.FC<CanvasProps> = ({ width, height }) => {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const atoms: Atom[] = [];


    const defaultColors = ['yellow', 'red', 'green', 'blue', 'purple', 'orange'];

    //assign the first 6 colors from the defaultColors array to the colors array
    const colors = defaultColors.slice(0, 3);

    const createAtoms = (number: number, color: string) => {
        for (let i = 0; i < number; i++) {
            atoms.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: 0,
                vy: 0,
                color
            });
        }
    }

    const initialAttractionValues = () => {
        const attractionValues: Record<string, Record<string, number>> = {};
        for (let i = 0; i < colors.length; i++) {
            attractionValues[colors[i]] = {};
            for (let j = 0; j < colors.length; j++) {
                attractionValues[colors[i]][colors[j]] = Math.floor((Math.random() * 200) - 100) / 50;
                console.log(attractionValues[colors[i]][colors[j]]);
            }
        }
        return attractionValues;
    }

    const rule = (atoms1: Atom[], atoms2: Atom[], g: number) => {

        if (canvasRef.current){
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
                        const F = (g * 1) / d;
                        fx += F * dx;
                        fy += F * dy;
                    }
                }
                atoms1[i].vx = (atoms1[i].vx + fx) * 0.5;
                atoms1[i].vy = (atoms1[i].vy + fy) * 0.5;
                atoms1[i].x += atoms1[i].vx;
                atoms1[i].y += atoms1[i].vy;

                // //make the atoms go through the walls and come out from the other side
                // if (atoms1[i].x <= 0) { atoms1[i].x = canvasRef.current!.width; }
                // if (atoms1[i].x >= canvasRef.current!.width) { atoms1[i].x = 0; }
                // if (atoms1[i].y <= 0) { atoms1[i].y = canvasRef.current!.height; }
                // if (atoms1[i].y >= canvasRef.current!.height) { atoms1[i].y = 0; }


                if (atoms1[i].x <= 0 || atoms1[i].x >= width) { atoms1[i].vx *= -1; }
                if (atoms1[i].y <= 0 || atoms1[i].y >= height) { atoms1[i].vy *= -1; }
            }

        }


    }

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas?.getContext('2d');


        for (let i = 0; i < colors.length; i++) {
            createAtoms(200, colors[i]);
        }

        const attractionValues = initialAttractionValues();

        const update = () => {
            for (let i = 0; i < colors.length; i++) {
                for (let j = 0; j < colors.length; j++) {
                    rule(atoms.filter(atom => atom.color === colors[i]), atoms.filter(atom => atom.color === colors[j]), attractionValues[colors[i]][colors[j]]);
                }
            }
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, width, height);

            atoms.forEach(atom => {
                ctx.fillStyle = atom.color;
                ctx.beginPath();
                ctx.arc(atom.x, atom.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            });

            requestAnimationFrame(update);
        }

        update();

    }, [width, height]);

    return (
            <canvas className={styles['canvas']} ref={canvasRef} width={width} height={height}/>
    );
};

export default Canvas;
