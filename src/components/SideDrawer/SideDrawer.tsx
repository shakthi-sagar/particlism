import React, { useState } from "react";
import { X, Plus, Trash2, Palette, Sliders, RotateCcw } from "lucide-react";
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
        const newConfig = {
            color: newColor,
            number: 200,
            attractions: colorsConfig.reduce((acc, config) => {
                acc[config.color] = Math.floor((Math.random() * 200) - 100) / 50;
                return acc;
            }, {} as { [key: string]: number })
        };

        // Add self-attraction for the new color
        newConfig.attractions[newColor] = Math.floor((Math.random() * 200) - 100) / 50;

        // Update existing configs to include attraction to the new color
        const updatedConfigs = colorsConfig.map(config => ({
            ...config,
            attractions: {
                ...config.attractions,
                [newColor]: Math.floor((Math.random() * 200) - 100) / 50
            }
        }));

        setColorsConfig([...updatedConfigs, newConfig]);
        setNewColor("#ffffff");
    };

    const removeColor = (index: number) => {
        if (colorsConfig.length <= 1) return; // Don't remove the last color
        
        const colorToRemove = colorsConfig[index].color;
        const newConfig = colorsConfig.filter((_, i) => i !== index);
        
        // Remove references to the deleted color from other configs
        const cleanedConfig = newConfig.map(config => ({
            ...config,
            attractions: Object.fromEntries(
                Object.entries(config.attractions).filter(([key]) => key !== colorToRemove)
            )
        }));
        
        setColorsConfig(cleanedConfig);
    };

    return (
        <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <Sliders size={20} />
                    <h2>Simulation Controls</h2>
                </div>
                <button onClick={onClose} className={styles.closeButton}>
                    <X size={18} />
                </button>
            </div>
            
            <div className={styles.content}>
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <Palette size={16} />
                        Particle Types
                    </h3>
                    <div className={styles.colorList}>
                        {colorsConfig.map((config, index) => (
                            <div key={index} className={styles.colorConfig}>
                                <div className={styles.colorHeader}>
                                    <div className={styles.colorPreview} style={{ backgroundColor: config.color }}></div>
                                    <span className={styles.colorLabel}>Type {index + 1}</span>
                                    {colorsConfig.length > 1 && (
                                        <button 
                                            className={styles.removeButton}
                                            onClick={() => removeColor(index)}
                                            title="Remove this particle type"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                
                                <div className={styles.controlGroup}>
                                    <label className={styles.label}>
                                        <span>Color</span>
                                        <div className={styles.colorInputWrapper}>
                                            <input
                                                type="color"
                                                value={config.color}
                                                onChange={(e) => handleColorChange(index, e.target.value)}
                                                className={styles.colorInput}
                                            />
                                            <span className={styles.colorValue}>{config.color}</span>
                                        </div>
                                    </label>
                                    
                                    <label className={styles.label}>
                                        <span>Particle Count: {config.number}</span>
                                        <div className={styles.sliderWrapper}>
                                            <input
                                                type="range"
                                                min="10"
                                                max="1000"
                                                value={config.number}
                                                onChange={(e) => handleNumberChange(index, parseInt(e.target.value, 10))}
                                                className={styles.slider}
                                            />
                                        </div>
                                    </label>
                                </div>

                                <div className={styles.attractionsSection}>
                                    <h4>Attraction Forces</h4>
                                    {colorsConfig.map((otherConfig, otherIndex) => {
                                        return (
                                            <label key={otherIndex} className={styles.attractionLabel}>
                                                <div className={styles.attractionHeader}>
                                                    <div className={styles.otherColorPreview} style={{ backgroundColor: otherConfig.color }}></div>
                                                    <span>
                                                        {index === otherIndex ? 'Self-Attraction' : `Type ${otherIndex + 1}`}
                                                    </span>
                                                    <span className={styles.attractionValue}>
                                                        {config.attractions[otherConfig.color]?.toFixed(2) || '0.00'}
                                                    </span>
                                                </div>
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
                                                    className={styles.attractionSlider}
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.addSection}>
                    <h3 className={styles.sectionTitle}>
                        <Plus size={16} />
                        Add New Type
                    </h3>
                    <div className={styles.addColor}>
                        <div className={styles.addColorInput}>
                            <input
                                type="color"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                className={styles.colorInput}
                            />
                            <span className={styles.addColorLabel}>Choose Color</span>
                        </div>
                        <button onClick={addColor} className={styles.addButton}>
                            <Plus size={16} />
                            Add Particle Type
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SideDrawer;
