import moment from "moment";
import html2canvas from "html2canvas";

/* -------------------------------------------
   BASIC UTILITIES
------------------------------------------- */
export const validateEmail = (email) =>
    /^[^\s/@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getLightColorFromImage = (imageUrl) =>
    new Promise((resolve, reject) => {
        if (!imageUrl || typeof imageUrl !== "string") {
            return reject(new Error("Invalid image URL"));
        }

        const img = new Image();
        if (!imageUrl.startsWith("data:")) img.crossOrigin = "anonymous";
        img.src = imageUrl;

        img.onload = () => {
            const c = document.createElement("canvas");
            const ctx = c.getContext("2d");
            c.width = img.width;
            c.height = img.height;
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, c.width, c.height).data;

            let r = 0, g = 0, b = 0, n = 0;
            for (let i = 0; i < data.length; i += 4) {
                const bright = (data[i] + data[i + 1] + data[i + 2]) / 3;
                if (bright > 180) {
                    r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
                }
            }
            resolve(n ? `rgb(${(r/n)|0}, ${(g/n)|0}, ${(b/n)|0})` : "#ffffff");
        };

        img.onerror = (e) => reject(new Error("Image could not be loaded or is blocked by CORS."));
    });

export const formatYearMonth = (ym) =>
    ym ? moment(ym, "YYYY-MM").format("MMM YYYY") : "";

/* -------------------------------------------
   OKLCH / TAILWIND COLOR FIX FOR html2canvas
------------------------------------------- */

/**
 * Decide safe fallback value for a given property.
 */
const fallbackForProp = (prop) => {
    const p = prop.toLowerCase();
    if (p.includes("background") || p.includes("border") || p.includes("outline") || p.includes("columnrule")) return "#fff";
    if (p.includes("box-shadow") || p.includes("text-shadow") || p.includes("filter") || p.includes("backdrop-filter")) return "none";
    if (p.includes("background-image")) return "none";
    if (p.includes("caret-color") || p.includes("accent-color")) return "auto";
    if (p.includes("text-decoration-color")) return "currentColor";
    if (p.includes("fill") || p.includes("stroke")) return "#000";
    // generic text color
    return "#000";
};

/**
 * Replace any oklch/oklab/var(--tw-*) in a single element (and its pseudo) with safe fallbacks.
 */
const patchElementColors = (el, style) => {
    if (!style) return;

    // Iterate over ALL computed style properties and sanitize any that contain oklch/oklab/var(--tw)
    for (let i = 0; i < style.length; i++) {
        const prop = style[i];
        const val = style.getPropertyValue(prop);
        if (!val) continue;

        if (/oklch|oklab|var\(--tw/i.test(val)) {
            const fb = fallbackForProp(prop);
            try {
                el.style.setProperty(prop, fb, "important");
            } catch {}
        }
    }

    // Inline style cleanup (if any cssText contains oklch)
    const inline = el.getAttribute("style") || "";
    const cleaned = inline.replace(/oklch\([^)]+\)/gi, "#000")
        .replace(/oklab\([^)]+\)/gi, "#000");
    if (cleaned !== inline) el.setAttribute("style", cleaned);

    // Drop Tailwind-related CSS variables that may resolve to oklch
    try {
        // Iterating el.style gives all inline custom props as well
        for (const name of el.style) {
            if (/^--tw|^--/.test(name)) {
                el.style.removeProperty(name);
            }
        }
    } catch {}
};

/**
 * Deep sanitize: element, its children, and pseudos.
 */
export const fixTailwindColors = (root) => {
    if (!root) return;

    const walk = (node) => {
        const cs = getComputedStyle(node);
        patchElementColors(node, cs);

        // Pseudo-elements
        ["::before", "::after"].forEach((pseudo) => {
            try {
                const ps = getComputedStyle(node, pseudo);
                // We can't set styles directly on pseudo, so we patch the host element
                // by overriding the relevant props on the host (works for html2canvas parsing).
                for (let i = 0; i < ps.length; i++) {
                    const prop = ps[i];
                    const val = ps.getPropertyValue(prop);
                    if (/oklch|oklab|var\(--tw/i.test(val)) {
                        const fb = fallbackForProp(prop);
                        node.style.setProperty(prop, fb, "important");
                    }
                }
            } catch {}
        });

        // Recurse
        for (const child of node.children) walk(child);
    };

    walk(root);

    // SVG fills/strokes
    root.querySelectorAll("svg *").forEach((shape) => {
        const fill = shape.getAttribute("fill");
        const stroke = shape.getAttribute("stroke");
        if (fill && /oklch|oklab/i.test(fill)) shape.setAttribute("fill", "#000");
        if (stroke && /oklch|oklab/i.test(stroke)) shape.setAttribute("stroke", "#000");
    });
};

/* -------------------------------------------
   CAPTURE DOM AS IMAGE (robust)
------------------------------------------- */
export async function captureElementAsImage(element) {
    if (!element) throw new Error("No element found.");

    // Create a hidden off-screen clone to avoid flicker and to safely mutate styles
    const clone = element.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.top = "-10000px";
    clone.style.left = "-10000px";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "-1";
    document.body.appendChild(clone);

    // Sanitize ALL colors in the clone
    fixTailwindColors(clone);

    // Render the clone
    const canvas = await html2canvas(clone, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
        // Extra safety: if your page uses webfonts, give them a moment (optional)
        // windowWidth: clone.scrollWidth,
    });

    clone.remove();
    return canvas.toDataURL("image/png");
}

/* -------------------------------------------
   DATA URL → FILE
------------------------------------------- */
export const dataURLtoFile = (dataUrl, fileName) => {
    const [head, body] = dataUrl.split(",");
    const mime = head.match(/:(.*?);/)[1];
    const bin = atob(body);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return new File([buf], fileName, { type: mime });
};
