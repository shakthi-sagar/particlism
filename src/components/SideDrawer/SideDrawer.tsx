import React, { useState } from "react";
import styles from "./SideDrawer.module.scss";

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    colorsConfig: { color: string; number: number; attractions: { [key: string]: number } }[];
    setColorsConfig: (newConfig: { color: string; number: number; attractions: { [key: string]: number } }[]) => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, colorsConfig, setColorsConfig }) => {
    const [newColor, setNewColor] = useState("#ffffff");

    const handleColorChange = (index: number, value: string) => {
        const newConfig = [...colorsConfig];
        newConfig[index].color = value;
        setColorsConfig(newConfig);
    };

    const handleNumberChange = (index: number, value: number) => {
        const newConfig = [...colorsConfig];
        newConfig[index].number = value;
        setColorsConfig(newConfig);
    };

    const handleAttractionChange = (index: number, key: string, value: number) => {
        const newConfig = [...colorsConfig];
        newConfig[index].attractions[key] = value;
        setColorsConfig(newConfig);
    };

    const addColor = () => {
        setColorsConfig([
            ...colorsConfig,
            {
                color: newColor,
                number: 200,
                attractions: {},
            },
        ]);
        setNewColor("#ffffff");
    };

    return (
        <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
            <button onClick={onClose} className={styles.closeButton}>
                Close
            </button>
            <div className={styles.colorList}>
                {colorsConfig.map((config, index) => (
                    <div key={index} className={styles.colorConfig}>
                        <label>
                            Color:
                            <input
                                type="color"
                                value={config.color}
                                onChange={(e) => handleColorChange(index, e.target.value)}
                            />
                        </label>
                        <label>
                            Number of Circles:
                            <input
                                type="range"
                                min="10"
                                max="1000"
                                value={config.number}
                                onChange={(e) => handleNumberChange(index, parseInt(e.target.value, 10))}
                            />
                            <span>{config.number}</span>
                        </label>
                        {colorsConfig.map((otherConfig, otherIndex) => {
                            if (index !== otherIndex) {
                                return (
                                    <label key={otherIndex}>
                                        Attraction to {otherConfig.color}:
                                        <input
                                            type="range"
                                            min="-1"
                                            max="1"
                                            step="0.01"
                                            value={config.attractions[otherConfig.color] || 0}
                                            onChange={(e) =>
                                                handleAttractionChange(
                                                    index,
                                                    otherConfig.color,
                                                    parseFloat(e.target.value)
                                                )
                                            }
                                        />
                                    </label>
                                );
                            }
                            return null;
                        })}
                    </div>
                ))}
            </div>
            <div className={styles.addColor}>
                <label>
                    New Color:
                    <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                    />
                </label>
                <button onClick={addColor} className={styles.addButton}>
                    Add Color
                </button>
            </div>
        </div>
    );
};

export default SideDrawer;
