import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import Canvas from "@/components/Canvas/Canvas";
import SideDrawer from "@/components/SideDrawer/SideDrawer";
import { ColorConfig, createRandomConfig, parseConfig } from "@/lib/particles";
import styles from "@/styles/Home.module.scss";

const decodeLegacyConfig = (value: string): ColorConfig[] | null => {
    try {
        return parseConfig(JSON.parse(atob(value.replace(/-/g, "+").replace(/_/g, "/"))));
    } catch {
        return null;
    }
};

export default function App() {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [colorsConfig, setColorsConfig] = useState<ColorConfig[]>(createRandomConfig);
    const [sharedSnapshot, setSharedSnapshot] = useState("");
    const [shareStatus, setShareStatus] = useState<"idle" | "sharing" | "copied" | "error">("idle");

    useEffect(() => {
        const resize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("c");
        const legacy = params.get("config");

        if (id && /^[A-Za-z0-9_-]{12}$/.test(id)) {
            fetch(`/api/configs/${id}`)
                .then(response => response.ok ? response.json() : Promise.reject())
                .then(value => {
                    const config = parseConfig(value);
                    if (!config) throw new Error("Invalid shared config");
                    setColorsConfig(config);
                    setSharedSnapshot(JSON.stringify(config));
                })
                .catch(() => setShareStatus("error"));
        } else if (legacy) {
            const config = decodeLegacyConfig(legacy);
            if (config) setColorsConfig(config);
        }
    }, []);

    useEffect(() => {
        if (!sharedSnapshot || JSON.stringify(colorsConfig) === sharedSnapshot) return;
        const url = new URL(window.location.href);
        url.searchParams.delete("c");
        url.searchParams.delete("config");
        window.history.replaceState(null, "", url);
        setSharedSnapshot("");
        setShareStatus("idle");
    }, [colorsConfig, sharedSnapshot]);

    const shareConfig = async () => {
        setShareStatus("sharing");
        try {
            const response = await fetch("/api/configs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(colorsConfig)
            });
            if (!response.ok) throw new Error("Share failed");

            const { id } = await response.json() as { id: string };
            const url = new URL(window.location.href);
            url.search = "";
            url.searchParams.set("c", id);
            window.history.replaceState(null, "", url);
            await navigator.clipboard.writeText(url.toString());
            setSharedSnapshot(JSON.stringify(colorsConfig));
            setShareStatus("copied");
        } catch {
            setShareStatus("error");
        }
    };

    return (
        <div className={styles["particlism-simulator"]}>
            <Canvas
                width={width}
                height={height}
                colorsConfig={colorsConfig}
                setColorsConfig={setColorsConfig}
                onShare={shareConfig}
                shareStatus={shareStatus}
            />
            <SideDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                colorsConfig={colorsConfig}
                setColorsConfig={setColorsConfig}
            />
            {!isDrawerOpen && (
                <button
                    className={styles["open-drawer-button"]}
                    onClick={() => setIsDrawerOpen(true)}
                    title="Open simulation controls"
                    aria-label="Open simulation controls"
                >
                    <Settings size={20} />
                </button>
            )}
        </div>
    );
}
