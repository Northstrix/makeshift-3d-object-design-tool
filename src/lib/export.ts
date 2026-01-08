
import type { EditorState, DesignLayer, ParticleStyle } from '@/components/editor/Editor';

export function exportToHtml(state: EditorState) {
  const { layers, showAxes, showGrid, showAxisLabels, useAbcLabels, useCustomAxisColors, xAxisColor, yAxisColor, zAxisColor } = state;
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Design Export</title>
    <style>
        body { margin: 0; overflow: hidden; background-color: #09090b; color: #fafafa; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@0.165.0/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@0.165.0/examples/jsm/"
        }
    }
    </script>
    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { FontLoader } from 'three/addons/loaders/FontLoader.js';
        import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
        import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

        const layers = ${JSON.stringify(layers)};
        const showAxes = ${showAxes};
        const showGrid = ${showGrid};
        const showAxisLabels = ${showAxisLabels};
        const useAbcLabels = ${useAbcLabels};
        const useCustomAxisColors = ${useCustomAxisColors};
        const xAxisColor = '${xAxisColor}';
        const yAxisColor = '${yAxisColor}';
        const zAxisColor = '${zAxisColor}';
        
        function createRoundedRectShape(w, h, r, borderWidth, isFilled) {
            const shape = new THREE.Shape();
            const x = -w / 2;
            const y = -h / 2;
            const clampedR = Math.min(r, w / 2, h / 2);
            shape.moveTo(x, y + clampedR);
            shape.lineTo(x, y + h - clampedR);
            shape.quadraticCurveTo(x, y + h, x + clampedR, y + h);
            shape.lineTo(x + w - clampedR, y + h);
            shape.quadraticCurveTo(x + w, y + h, x + w, y + h - clampedR);
            shape.lineTo(x + w, y + clampedR);
            shape.quadraticCurveTo(x + w, y, x + w - clampedR, y);
            shape.lineTo(x + clampedR, y);
            shape.quadraticCurveTo(x, y, x, y + clampedR);
            if (!isFilled) {
                const hole = new THREE.Path();
                const innerW = w - borderWidth * 2;
                const innerH = h - borderWidth * 2;
                const innerR = Math.max(0, clampedR - borderWidth);
                const innerX = -innerW / 2;
                const innerY = -innerH / 2;
                hole.moveTo(innerX, innerY + innerR);
                hole.lineTo(innerX, innerY + innerH - innerR);
                hole.quadraticCurveTo(innerX, innerY + innerH, innerX + innerR, innerY + innerH);
                hole.lineTo(innerX + innerW - innerR, innerY + innerH);
                hole.quadraticCurveTo(innerX + innerW, innerY + innerH, innerX + innerW, innerY + innerH - innerR);
                hole.lineTo(innerX + innerW, innerY + innerR);
                hole.quadraticCurveTo(innerX + innerW, innerY, innerX + innerW - innerR, innerY);
                hole.lineTo(innerX + innerR, innerY);
                hole.quadraticCurveTo(innerX, innerY, innerX, innerY + innerR);
                shape.holes.push(hole);
            }
            return shape;
        }

        function createHalfSquareHalfCircleShape(w, h, borderWidth, isFilled) {
          const shape = new THREE.Shape();
          const radius = w / 2;
          const rectHeight = h - radius;

          shape.moveTo(-radius, 0);
          shape.lineTo(-radius, rectHeight);
          shape.absarc(0, rectHeight, radius, Math.PI, 0, true);
          shape.lineTo(radius, 0);
          shape.closePath();
          
          if (!isFilled && borderWidth > 0) {
            const hole = new THREE.Path();
            const innerRadius = radius - borderWidth;
            const innerRectHeight = rectHeight;
            const bottomY = borderWidth;
            const leftX = -radius + borderWidth;
            const rightX = radius - borderWidth;

            if (innerRadius > 0) {
                hole.moveTo(leftX, bottomY);
                hole.lineTo(leftX, innerRectHeight);
                hole.absarc(0, innerRectHeight, innerRadius, Math.PI, 0, true);
                hole.lineTo(rightX, bottomY);
                hole.closePath();
                shape.holes.push(hole);
            }
          }
          return shape;
        }

        function createHalfCircleShape(w, h, elongation, borderWidth, isFilled) {
            const shape = new THREE.Shape();
            const radius = w / 2;
            const straightPart = h - radius;
            const elongationFactor = (elongation / 100) * straightPart;
            
            shape.moveTo(-radius, 0);
            shape.lineTo(-radius, elongationFactor);
            shape.absarc(0, elongationFactor, radius, Math.PI, 0, true);
            shape.lineTo(radius, 0);
            shape.closePath();

            if (!isFilled && borderWidth > 0) {
                const hole = new THREE.Path();
                const innerRadius = radius - borderWidth;
                const innerElongation = elongationFactor;
                const bottomY = borderWidth;
                const leftX = -radius + borderWidth;
                const rightX = radius - borderWidth;
                
                if (innerRadius > 0) {
                    hole.moveTo(leftX, bottomY);
                    hole.lineTo(leftX, innerElongation);
                    hole.absarc(0, innerElongation, innerRadius, Math.PI, 0, true);
                    hole.lineTo(rightX, bottomY);
                    hole.closePath();
                    shape.holes.push(hole);
                }
            }
            return shape;
        }

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x09090b);
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(250, 250, 250);
        camera.lookAt(0,0,0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(80, 100, 120);
        scene.add(directionalLight);

        if (showAxes) {
          const axisLength = 250;
          const createAxis = (color, from, to) => {
              const material = new THREE.LineBasicMaterial({ color, linewidth: 1 });
              const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
              return new THREE.Line(geometry, material);
          };
          scene.add(createAxis(new THREE.Color(useCustomAxisColors ? xAxisColor : '#3C83F6'), new THREE.Vector3(0, 0, 0), new THREE.Vector3(axisLength, 0, 0))); // X
          scene.add(createAxis(new THREE.Color(useCustomAxisColors ? yAxisColor : '#AF3CF6'), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, axisLength, 0))); // Y
          scene.add(createAxis(new THREE.Color(useCustomAxisColors ? zAxisColor : '#3CF6DD'), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, axisLength))); // Z
        }
        
        if (showGrid) {
            const grid = new THREE.GridHelper(500, 10);
            grid.material.opacity = 0.15;
            grid.material.transparent = true;
            scene.add(grid);
        }

        const fontLoader = new FontLoader();
        const fontCache = new Map();

        const fontPaths = {
            'Inter': 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', 'Roboto': 'https://threejs.org/examples/fonts/roboto_regular.typeface.json', 'Lato': '/fonts/lato_regular.typeface.json', 'Open Sans': 'https://threejs.org/examples/fonts/gentilis_regular.typeface.json', 'Montserrat': '/fonts/montserrat_regular.typeface.json', 'Oswald': '/fonts/oswald_regular.typeface.json', 'Slabo 27px': '/fonts/slabo_27px_regular.typeface.json', 'Raleway': '/fonts/raleway_regular.typeface.json', 'PT Sans': 'https://threejs.org/examples/fonts/pt_sans_regular.typeface.json', 'Merriweather': '/fonts/merriweather_regular.typeface.json', 'Noto Sans': '/fonts/noto_sans_regular.typeface.json', 'Ubuntu': '/fonts/ubuntu_regular.typeface.json', 'Playfair Display': '/fonts/playfair_display_regular.typeface.json', 'Lora': '/fonts/lora_regular.typeface.json', 'Poppins': '/fonts/poppins_regular.typeface.json', 'Inter_700': 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', 'Roboto_700': 'https://threejs.org/examples/fonts/roboto_bold.typeface.json', 'Lato_700': '/fonts/lato_bold.typeface.json', 'Open Sans_700': 'https://threejs.org/examples/fonts/gentilis_bold.typeface.json', 'Montserrat_700': '/fonts/montserrat_bold.typeface.json', 'Oswald_700': '/fonts/oswald_bold.typeface.json', 'Raleway_700': '/fonts/raleway_bold.typeface.json', 'PT Sans_700': '/fonts/pt_sans_bold.typeface.json', 'Merriweather_700': '/fonts/merriweather_bold.typeface.json', 'Noto Sans_700': '/fonts/noto_sans_bold.typeface.json', 'Ubuntu_700': '/fonts/ubuntu_bold.typeface.json', 'Playfair Display_700': '/fonts/playfair_display_bold.typeface.json', 'Lora_700': '/fonts/lora_bold.typeface.json', 'Poppins_700': '/fonts/poppins_bold.typeface.json'
        };

        function loadFont(fontFamily, fontWeight) {
            return new Promise((resolve, reject) => {
                const weightStr = fontWeight >= 700 ? '700' : '400';
                const fontKey = fontFamily + '_' + weightStr;
                const defaultFontKey = 'Inter_400';

                if (fontCache.has(fontKey)) {
                    resolve(fontCache.get(fontKey));
                    return;
                }
                
                const fontUrl = fontPaths[fontKey] || fontPaths[fontFamily] || fontPaths[defaultFontKey] || 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json';

                fontLoader.load(fontUrl, (font) => {
                    fontCache.set(fontKey, font);
                    resolve(font);
                }, undefined, (error) => {
                    console.error('Font could not be loaded: ' + fontKey, error);
                    if (fontCache.has(defaultFontKey)) {
                        resolve(fontCache.get(defaultFontKey));
                    } else {
                        fontLoader.load(fontPaths[defaultFontKey], (defaultFont) => {
                            fontCache.set(defaultFontKey, defaultFont);
                            resolve(defaultFont);
                        }, undefined, reject);
                    }
                });
            });
        }

        
        if (showAxisLabels) {
          loadFont('Inter', 400).then(font => {
            const createLabel = (text, color, position) => {
                const textGeo = new TextGeometry(text, { font: font, size: 10, height: 1 });
                textGeo.computeBoundingBox();
                const textMat = new THREE.MeshBasicMaterial({ color });
                const label = new THREE.Mesh(textGeo, textMat);
                const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
                const textHeight = textGeo.boundingBox.max.y - textGeo.boundingBox.min.y;
                label.position.copy(position);
                label.position.x -= textWidth / 2;
                label.position.y -= textHeight / 2;
                return label;
            };
            const axisLength = 250;
            const xLabel = useAbcLabels ? "A" : "X";
            const yLabel = useAbcLabels ? "B" : "Y";
            const zLabel = useAbcLabels ? "C" : "Z";
            scene.add(createLabel(xLabel, new THREE.Color(useCustomAxisColors ? xAxisColor : '#3C83F6'), new THREE.Vector3(axisLength + 15, 0, 0)));
            scene.add(createLabel(yLabel, new THREE.Color(useCustomAxisColors ? yAxisColor : '#AF3CF6'), new THREE.Vector3(0, axisLength + 15, 0)));
            scene.add(createLabel(zLabel, new THREE.Color(useCustomAxisColors ? zAxisColor : '#3CF6DD'), new THREE.Vector3(0, 0, axisLength + 15)));
          });
        }

        const customVertexShader = \`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }\`;
        const flowFragShader = \`precision highp float; varying vec2 vUv; uniform float uTime; uniform float uVelocity; uniform float uDetail; uniform float uTwist; uniform float uSpeed; uniform float uContrast; uniform float uRgbMultiplierR; uniform float uRgbMultiplierG; uniform float uRgbMultiplierB; uniform float uColorOffset; uniform float uHue; uniform float uSaturation; vec3 rgb2hsv(vec3 c) { vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0); vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)); vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r)); float d = q.x - min(q.w, q.y); float e = 1.0e-10; return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x); } vec3 hsv2rgb(vec3 c) { vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0); vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www); return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y); } float f(in vec2 p) { return sin(p.x + sin(p.y + uTime * uVelocity)) * sin(p.y * p.x * 0.1 + uTime * uVelocity); } void main() { vec2 p = vUv * 5.0; vec2 ep = vec2(0.05, 0.0); vec2 rz = vec2(0.0); for (int i = 0; i < 20; i++) { float t0 = f(p); float t1 = f(p + ep.xy); float t2 = f(p + ep.yx); vec2 g = vec2((t1 - t0), (t2 - t0)) / ep.xx; vec2 t = vec2(-g.y, g.x); p += (uTwist * 0.01) * t + g * (1.0 / uDetail); p.x += sin(uTime * uSpeed / 10.0) / 10.0; p.y += cos(uTime * uSpeed / 10.0) / 10.0; rz = g; } vec3 colorVec = vec3(rz * 0.5 + 0.5, 1.5); colorVec.r *= uRgbMultiplierR; colorVec.g *= uRgbMultiplierG; colorVec.b *= uRgbMultiplierB; colorVec += uColorOffset; colorVec = (colorVec - 0.5) * uContrast + 0.5; vec3 hsv = rgb2hsv(colorVec); hsv.x += uHue / 360.0; hsv.y *= uSaturation; colorVec = hsv2rgb(hsv); gl_FragColor = vec4(colorVec, 1.0); }\`;
        const meltFragShader = \`precision highp float; varying vec2 vUv; uniform float uTime; uniform float uSpeed; uniform float uZoom; uniform float uDetail; uniform float uHue; uniform float uSaturation; uniform float uContrast; vec3 rgb2hsv(vec3 c) { vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0); vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)); vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r)); float d = q.x - min(q.w, q.y); float e = 1.0e-10; return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x); } vec3 hsv2rgb(vec3 c) { vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0); vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www); return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y); } float f(in vec2 p) { float t = uTime * uSpeed; return sin(p.x + sin(p.y + t * 0.2)) * sin(p.y * p.x * 0.1 + t * 0.2); } void main() { vec2 p = vUv * max(0.1, uZoom); vec2 rz = vec2(0.0); float stepMul = mix(0.0, 0.1, clamp(uDetail, 0.0, 1.0)); for (int i = 0; i < 15; i++) { float t0 = f(p); float t1 = f(p + vec2(0.05, 0.0)); vec2 g = vec2((t1 - t0), (f(p + vec2(0.0, 0.05)) - t0)) / 0.05; vec2 t = vec2(-g.y, g.x); p += 0.05 * t + g * (0.2 + stepMul); rz = g; } vec3 col = vec3(rz * 0.5 + 0.5, 1.0); vec3 hsv = rgb2hsv(col); hsv.x += uHue / 360.0; hsv.y *= uSaturation; col = hsv2rgb(hsv); col = (col - 0.5) * uContrast + 0.5; gl_FragColor = vec4(col, 1.0); }\`;
        const magneticStripesVertexShader = \`uniform float time; uniform float electricIntensity; uniform float arcFrequency; varying vec3 vPosition; varying vec3 vNormal; varying float vIntensity; varying vec2 vUv; float hash(float n) { return fract(sin(n) * 43758.5453); } float noise(vec3 x) { vec3 p = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f); float n = p.x + p.y * 57.0 + p.z * 113.0; return mix(mix(mix(hash(n), hash(n + 1.0), f.x), mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y), mix(mix(hash(n + 113.0), hash(n + 114.0), f.x), mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z); } float fbm(vec3 p) { float value = 0.0; float amplitude = 0.5; float frequency = 1.0; for (int i = 0; i < 5; i++) { value += amplitude * noise(p * frequency); frequency *= 2.0; amplitude *= 0.5; } return value; } void main() { vUv = uv; vNormal = normal; vec3 pos = position; float wave = sin(pos.x * 2.5 + time * 1.8) * cos(pos.y * 2.2 + time * 1.4) * sin(pos.z * 2.0 + time * 1.1) * 0.35; wave += sin(pos.x * 4.0 - time * 2.1) * cos(pos.y * 3.5 - time * 1.6) * sin(pos.z * 4.5 - time * 1.0) * 0.25; wave += sin(pos.x * 9.0 + time * 3.5) * cos(pos.y * 8.0 + time * 2.8) * sin(pos.z * 10.0 + time * 4.0) * 0.1; float arcNoise = fbm(vec3(pos * 6.0 + time * 3.5)); float arcEffect = 0.0; float arcThreshold = 0.6 + (1.0 - arcFrequency) * 0.2; if (arcNoise > arcThreshold) { float arcStrength = smoothstep(arcThreshold, arcThreshold + 0.1, arcNoise); arcEffect = arcStrength * arcFrequency * 2.0; } if (hash(floor(time * (10.0 + arcFrequency * 15.0)) + length(position) * 15.0) > 0.97) { arcEffect += hash(position.x * 10.0 + position.y * 5.0) * arcFrequency * 1.8; } float generalDistortion = fbm(pos * 3.5 - time * 1.5) * 0.1; pos += normal * (wave * 0.18 * electricIntensity); pos += normal * (arcEffect * 0.45 * electricIntensity); pos += normal * (generalDistortion * electricIntensity); vIntensity = wave * 0.5 + 0.5 + arcEffect * 3.0 + abs(generalDistortion) * 1.0; vIntensity = clamp(vIntensity, 0.0, 3.0); vPosition = pos; gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0); }\`;
        const magneticStripesFragmentShader = \`uniform float time; uniform float electricIntensity; uniform float glowStrength; uniform float arcFrequency; uniform vec3 uColor1, uColor2, uColor3, uColor4, uColor5, uColor6, uColor7, uColor8; varying vec3 vPosition; varying vec3 vNormal; varying float vIntensity; varying vec2 vUv; float hash(float n) { return fract(sin(n) * 43758.5453); } float noise(vec3 x) { vec3 p = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f); float n = p.x + p.y * 57.0 + p.z * 113.0; return mix(mix(mix(hash(n), hash(n + 1.0), f.x), mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y), mix(mix(hash(n + 113.0), hash(n + 114.0), f.x), mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z); } float fbm(vec3 p) { float value = 0.0; float amplitude = 0.5; for (int i = 0; i < 5; i++) { value += amplitude * noise(p); p *= 2.0; amplitude *= 0.5; } return value; } void main() { float t1 = sin(time * 0.8 + vUv.x * 5.0) * 0.5 + 0.5; float t2 = cos(time * 0.6 - vUv.y * 6.0) * 0.5 + 0.5; float t3 = sin(time * 1.5 + length(vPosition) * 2.0) * 0.5 + 0.5; float noisePattern = fbm(vPosition * 3.5 + vec3(time * 0.8, -time * 0.5, time * 1.1)); float energyFlow = fbm(vPosition * 2.5 - vec3(time * 2.2, -time * 1.2, time * 1.8)); float slowPulse = sin(time * 2.5 + vPosition.x * 2.0) * 0.5 + 0.5; float fastPulse = sin(time * 18.0 + vPosition.y * 5.0) * 0.5 + 0.5; float arcSpeed1 = 10.0 + arcFrequency * 5.0; float arcTravel1 = sin(vPosition.x * 15.0 + vPosition.y * 10.0 + time * arcSpeed1); float arcTravel2 = cos(vPosition.y * 9.0 - vPosition.z * 12.0 - time * arcSpeed1 * 0.8); float arcTravel3 = sin(vPosition.z * 11.0 + vPosition.x * 13.0 + time * arcSpeed1 * 1.2); float arc1 = smoothstep(0.75, 0.9, arcTravel1) * smoothstep(0.9, 0.75, arcTravel1); float arc2 = smoothstep(0.7, 0.85, arcTravel2) * smoothstep(0.85, 0.7, arcTravel2); float arc3 = smoothstep(0.8, 0.95, arcTravel3) * smoothstep(0.95, 0.8, arcTravel3); float arc = pow(max(max(arc1, arc2), arc3), 1.5) * electricIntensity * (1.0 + arcFrequency); vec3 baseColor = mix(uColor1, uColor2, noisePattern * 0.6 + 0.4); baseColor = mix(baseColor, uColor3, t1 * 0.6); baseColor = mix(baseColor, uColor4, energyFlow * 0.4 * electricIntensity * slowPulse); baseColor = mix(baseColor, uColor8, sin(vPosition.z * 5.0 - time * 1.5) * 0.1 * t2); float arcWidth = 0.6 + sin(time * 4.0 + vPosition.x * 6.0) * 0.4; vec3 arcColor = mix(uColor4, uColor5, arcWidth * t2); arcColor = mix(arcColor, uColor6, arc * t3 * 0.8); vec3 finalColor = mix(baseColor, arcColor, arc * arcWidth); float highlight = smoothstep(0.6, 1.5, vIntensity); finalColor = mix(finalColor, uColor4, highlight * 0.4 * (1.0 - arc)); finalColor = mix(finalColor, uColor5, highlight * 0.2 * arc); float edgeFactor = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.5); vec3 edgeColor = mix(uColor3, uColor5, t2 * slowPulse); edgeColor = mix(edgeColor, uColor6, edgeFactor * 0.4); finalColor += edgeColor * edgeFactor * electricIntensity * 0.8; float flicker = 0.9 + 0.1 * hash(vPosition.x * 20.0 + floor(time * (35.0 + arcFrequency * 15.0))); flicker *= 0.96 + 0.04 * sin(time * 80.0 + vPosition.y * 40.0); finalColor *= flicker; float glow = pow(vIntensity * 0.6, 2.0) * glowStrength; glow = clamp(glow, 0.0, 1.0); finalColor += mix(uColor4, uColor5, t3) * glow * 0.4; finalColor += uColor6 * glow * 0.25 * fastPulse; finalColor *= (0.7 + electricIntensity * 0.5); gl_FragColor = vec4(finalColor, 1.0); }\`;

        const glareShader = {
          vertex: \`
            varying vec2 vUv;
            attribute vec4 color;
            varying vec4 vColor;
            void main() {
              vUv = uv;
              vColor = color;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }\`,
          fragment: \`
            varying vec2 vUv;
            varying vec4 vColor;
            void main() {
              gl_FragColor = vColor;
            }\`,
        };

        const particleShader = {
            vertex: \`
                uniform float time;
                uniform vec3 mousePos;
                uniform float size;
                attribute float particleIndex;
                attribute float particleType;
                varying vec3 vColor;
                varying float vDistanceToMouse;
                varying float vType;
                varying float vIndex;

                float rand(vec2 co){ return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453); }

                void main() {
                    vColor = color;
                    vType = particleType;
                    vIndex = particleIndex;
                    vec3 pos = position;
                    float t = time * 0.5;
                    float idx = particleIndex * 0.01;
                    float noiseFactor1 = sin(idx * 30.0 + t * 15.0) * 0.4 + 0.6;
                    vec3 offset1 = vec3(cos(t * 1.2 + idx * 5.0) * noiseFactor1, sin(t * 0.9 + idx * 6.0) * noiseFactor1, cos(t * 1.1 + idx * 7.0) * noiseFactor1) * 0.4;
                    float noiseFactor2 = rand(vec2(idx, idx * 0.5)) * 0.5 + 0.5;
                    float speedFactor = 0.3;
                    vec3 offset2 = vec3(sin(t * speedFactor * 1.3 + idx * 1.1) * noiseFactor2, cos(t * speedFactor * 1.7 + idx * 1.2) * noiseFactor2, sin(t * speedFactor * 1.1 + idx * 1.3) * noiseFactor2) * 0.8;
                    pos += offset1 + offset2;
                    vec3 toMouse = mousePos - pos;
                    float dist = length(toMouse);
                    vDistanceToMouse = 0.0;
                    float interactionRadius = 30.0;
                    float falloffStart = 5.0;
                    if (dist < interactionRadius) {
                        float influence = smoothstep(interactionRadius, falloffStart, dist);
                        vec3 repelDir = normalize(pos - mousePos);
                        pos += repelDir * influence * 15.0;
                        vDistanceToMouse = influence;
                    }
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    float perspectiveFactor = 700.0 / -mvPosition.z;
                    gl_PointSize = size * perspectiveFactor * (1.0 + vDistanceToMouse * 0.5);
                }\`,
            fragment: \`
                uniform float time;
                uniform vec3 emissive;
                varying vec3 vColor;
                varying float vDistanceToMouse;
                varying float vType;
                varying float vIndex;

                void main() {
                    vec2 uv = gl_PointCoord * 2.0 - 1.0;
                    float dist = length(uv);
                    if (dist > 1.0) discard;
                    float alpha = 0.0;
                    vec3 baseColor = vColor;
                    vec3 finalColor = baseColor + emissive;
                    if (vType < 0.5) {
                        float core = smoothstep(0.2, 0.15, dist) * 0.9;
                        float glow = pow(max(0.0, 1.0 - dist), 3.0) * 0.5;
                        alpha = core + glow;
                    } else if (vType < 1.5) {
                        float ringWidth = 0.1;
                        float ringCenter = 0.65;
                        float ringShape = exp(-pow(dist - ringCenter, 2.0) / (2.0 * ringWidth * ringWidth));
                        alpha = smoothstep(0.1, 0.5, ringShape) * 0.8;
                        alpha += smoothstep(0.3, 0.0, dist) * 0.1;
                    } else {
                        float pulse = sin(dist * 5.0 - time * 2.0 + vIndex * 0.1) * 0.1 + 0.9;
                        alpha = pow(max(0.0, 1.0 - dist), 2.5) * pulse * 0.9;
                    }
                    finalColor = mix(finalColor, finalColor * 1.3 + 0.1, vDistanceToMouse * 1.0);
                    alpha *= 0.9;
                    alpha = clamp(alpha, 0.0, 1.0);
                    gl_FragColor = vec4(finalColor * alpha, alpha);
                }\`
        };

        const objects = new Map();
        const clock = new THREE.Clock();
        const worldMouse = new THREE.Vector3();

        function createShape(layer) {
            let shape;
            switch(layer.shape) {
                case 'circle':
                    shape = new THREE.Shape();
                    shape.absarc(0, 0, layer.width / 2, 0, Math.PI * 2, false);
                    if (!layer.fill) {
                        const hole = new THREE.Path();
                        hole.absarc(0, 0, layer.width / 2 - layer.borderWidth, 0, Math.PI * 2, true);
                        shape.holes.push(hole);
                    }
                    break;
                case 'half-square-half-circle':
                    shape = createHalfSquareHalfCircleShape(layer.width, layer.height, layer.borderWidth, layer.fill);
                    break;
                case 'half-circle':
                    shape = createHalfCircleShape(layer.width, layer.height, layer.elongation, layer.borderWidth, layer.fill);
                    break;
                case 'rect':
                default:
                    shape = createRoundedRectShape(layer.width, layer.height, layer.borderRadius, layer.borderWidth, layer.fill);
                    break;
            }
            return shape;
        }

        async function createLayers() {
            for (const layer of layers) {
                if (!layer.visible) continue;
                
                let newObject;

                const createMesh = (geometry) => {
                    geometry.center();
                    let material;
                    const materialProps = {
                        color: layer.color,
                        opacity: layer.opacity,
                        transparent: layer.opacity < 1,
                        emissive: layer.emissive,
                        side: THREE.DoubleSide
                    };
                    switch(layer.materialType) {
                        case 'phong': material = new THREE.MeshPhongMaterial({ ...materialProps, shininess: layer.shininess }); break;
                        case 'lambert': material = new THREE.MeshLambertMaterial(materialProps); break;
                        case 'normal': material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide, opacity: layer.opacity, transparent: layer.opacity < 1 }); break;
                        case 'metal':
                        case 'standard': material = new THREE.MeshStandardMaterial({ ...materialProps, metalness: layer.metalness, roughness: layer.roughness }); break;
                        case 'flow': material = new THREE.ShaderMaterial({ vertexShader: customVertexShader, fragmentShader: flowFragShader, uniforms: { uTime: { value: 0 }, uVelocity: { value: layer.flowVelocity }, uDetail: { value: layer.flowDetail }, uTwist: { value: layer.flowTwist }, uSpeed: { value: layer.flowSpeed }, uContrast: { value: layer.flowContrast }, uRgbMultiplierR: { value: layer.flowRgbMultiplierR }, uRgbMultiplierG: { value: layer.flowRgbMultiplierG }, uRgbMultiplierB: { value: layer.flowRgbMultiplierB }, uColorOffset: { value: layer.flowColorOffset }, uHue: { value: layer.flowHue }, uSaturation: { value: layer.flowSaturation } }, transparent: layer.opacity < 1, opacity: layer.opacity }); break;
                        case 'melt': material = new THREE.ShaderMaterial({ vertexShader: customVertexShader, fragmentShader: meltFragShader, uniforms: { uTime: { value: 0 }, uSpeed: { value: layer.meltSpeed }, uZoom: { value: layer.meltZoom }, uDetail: { value: layer.meltDetail }, uHue: { value: layer.meltHue }, uSaturation: { value: layer.meltSaturation }, uContrast: { value: layer.meltContrast } }, transparent: layer.opacity < 1, opacity: layer.opacity }); break;
                        case 'magnetic-stripes': material = new THREE.ShaderMaterial({ vertexShader: magneticStripesVertexShader, fragmentShader: magneticStripesFragmentShader, uniforms: { time: { value: 0 }, electricIntensity: { value: layer.magneticIntensity }, arcFrequency: { value: layer.magneticArcFrequency }, glowStrength: { value: layer.magneticGlow }, uColor1: { value: new THREE.Color(layer.magneticColor1) }, uColor2: { value: new THREE.Color(layer.magneticColor2) }, uColor3: { value: new THREE.Color(layer.magneticColor3) }, uColor4: { value: new THREE.Color(layer.magneticColor4) }, uColor5: { value: new THREE.Color(layer.magneticColor5) }, uColor6: { value: new THREE.Color(layer.magneticColor6) }, uColor7: { value: new THREE.Color(layer.magneticColor7) }, uColor8: { value: new THREE.Color(layer.magneticColor8) } }, transparent: layer.opacity < 1, opacity: layer.opacity }); break;
                        default: material = new THREE.MeshStandardMaterial({ ...materialProps, metalness: layer.metalness, roughness: layer.roughness }); break;
                    }
                    return new THREE.Mesh(geometry, material);
                };

                if (layer.materialType === 'particle') {
                    const font = layer.shape === 'text' ? await loadFont(layer.fontFamily, layer.fontWeight) : null;
                    const pointsGeometry = new THREE.BufferGeometry();
                    const positions = new Float32Array(layer.particleCount * 3);
                    const colors = new Float32Array(layer.particleCount * 3);
                    const particleIndices = new Float32Array(layer.particleCount);
                    const particleTypes = new Float32Array(layer.particleCount);
                    
                    const tempMesh = new THREE.Mesh(font ? 
                        new TextGeometry(layer.text, {font, size: layer.fontSize, height: layer.depth, bevelEnabled: false}) :
                        new THREE.ExtrudeGeometry(createShape(layer), { depth: layer.depth, bevelEnabled: false })
                    );
                    tempMesh.geometry.center();
                    const sampler = new MeshSurfaceSampler(tempMesh).build();
                    const _position = new THREE.Vector3();
                    const _color = new THREE.Color(layer.color);

                    for (let i = 0; i < layer.particleCount; i++) {
                        sampler.sample(_position);
                        positions.set([_position.x, _position.y, _position.z], i * 3);
                        colors.set([_color.r, _color.g, _color.b], i * 3);
                        particleIndices[i] = i;
                        particleTypes[i] = { 'glow': 0.0, 'ring': 1.0, 'firefly': 2.0 }[layer.particleStyle];
                    }
                    tempMesh.geometry.dispose();

                    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                    pointsGeometry.setAttribute('particleIndex', new THREE.BufferAttribute(particleIndices, 1));
                    pointsGeometry.setAttribute('particleType', new THREE.BufferAttribute(particleTypes, 1));

                    const particleMat = new THREE.ShaderMaterial({
                        uniforms: {
                            time: { value: 0 },
                            mousePos: { value: new THREE.Vector3(10000, 10000, 0) },
                            size: { value: layer.particleSize },
                            emissive: { value: new THREE.Color(layer.emissive) },
                        },
                        vertexShader: particleShader.vertex,
                        fragmentShader: particleShader.fragment,
                        transparent: true,
                        depthWrite: false,
                        blending: THREE.AdditiveBlending,
                        vertexColors: true
                    });
                    newObject = new THREE.Points(pointsGeometry, particleMat);

                } else {
                    const group = new THREE.Group();
                    let mesh;
                    if (layer.shape === 'text') {
                        try {
                            const font = await loadFont(layer.fontFamily, layer.fontWeight);
                            const textGeo = new TextGeometry(layer.text, { font, size: layer.fontSize, height: layer.depth, bevelEnabled: false });
                            mesh = createMesh(textGeo);
                            group.add(mesh);
                        } catch(e) { console.error(e); continue; }
                    } else {
                        const shape = createShape(layer);
                        const extrudeSettings = { depth: layer.depth, bevelEnabled: false };
                        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                        mesh = createMesh(geometry);
                        group.add(mesh);
                    }
                    
                    if (layer.emissive !== '#000000' && !['normal', 'flow', 'melt', 'magnetic-stripes'].includes(layer.materialType)) {
                        const glareGeometry = new THREE.BufferGeometry();
                        glareGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
                        glareGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(0), 4));
                        const glareMaterial = new THREE.ShaderMaterial({
                            vertexShader: glareShader.vertex,
                            fragmentShader: glareShader.fragment,
                            transparent: true,
                            depthWrite: false,
                            vertexColors: true,
                            side: THREE.DoubleSide,
                        });
                        const glareMesh = new THREE.Mesh(glareGeometry, glareMaterial);
                        glareMesh.name = 'glare';
                        group.add(glareMesh);
                    }
                    newObject = group;
                }

                newObject.position.set(layer.x, -layer.y, layer.z);
                newObject.rotation.z = -THREE.MathUtils.degToRad(layer.rotation);
                scene.add(newObject);
                objects.set(layer.id, newObject);
            }
        }
        createLayers();

        document.body.addEventListener('mousemove', (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
            const intersectPoint = new THREE.Vector3();
            if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
                worldMouse.lerp(intersectPoint, 0.1);
            }
        });

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            const elapsedTime = clock.getElapsedTime();

            objects.forEach((object, id) => {
                const layer = layers.find(l => l.id === id);
                if (!layer) return;

                if (layer.materialType === 'particle') {
                    const points = object;
                    if (points.material instanceof THREE.ShaderMaterial) {
                        points.material.uniforms.time.value = elapsedTime;
                        points.material.uniforms.mousePos.value.copy(worldMouse);
                    }
                } else if (object.children[0] && object.children[0].material instanceof THREE.ShaderMaterial) {
                     const mat = object.children[0].material;
                     if(mat.uniforms.time) mat.uniforms.time.value = elapsedTime;
                     if(mat.uniforms.uTime) mat.uniforms.uTime.value = elapsedTime;
                } else {
                    const group = object;
                    const glareMesh = group.getObjectByName('glare');
                    if (!layer || layer.emissive === '#000000' || !glareMesh) {
                        if (glareMesh) glareMesh.visible = false;
                        return;
                    }
                    
                    glareMesh.visible = true;
                    const glareGeometry = glareMesh.geometry;
                    const mainMesh = group.children[0];
                    if (!mainMesh || !mainMesh.geometry) return;
                    
                    camera.updateMatrixWorld();
                    mainMesh.updateMatrixWorld();
                    const camPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

                    const vertices = [];
                    for(let i = 0; i < mainMesh.geometry.attributes.position.count; i++) {
                        vertices.push(new THREE.Vector3().fromBufferAttribute(mainMesh.geometry.attributes.position, i));
                    }

                    const frontVertices = vertices.filter(v => v.z > 0);
                    
                    mainMesh.geometry.computeBoundingBox();
                    const center = new THREE.Vector3();
                    mainMesh.geometry.boundingBox.getCenter(center);
                    center.applyMatrix4(mainMesh.matrixWorld);

                    const directionToCenter = new THREE.Vector3().subVectors(center, camPos).normalize();
                    const frontNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(mainMesh.quaternion);
                    const frontDot = directionToCenter.dot(frontNormal);
                    const glareColor = new THREE.Color(layer.emissive);
                    const alpha = Math.max(0, 1.0 - Math.abs(frontDot));

                    const pushDistance = 50;
                    const newPositions = new Float32Array(frontVertices.length * 2 * 3);
                    const newColors = new Float32Array(frontVertices.length * 2 * 4);
                    const newIndices = [];

                    for(let i = 0; i < frontVertices.length; i++) {
                        const v = frontVertices[i];
                        newPositions.set([v.x, v.y, v.z], i * 3);
                        newColors.set([glareColor.r, glareColor.g, glareColor.b, alpha], i * 4);
                        const eyeToVertex = new THREE.Vector3().subVectors(v, camPos).normalize();
                        const extruded = new THREE.Vector3().addVectors(v, eyeToVertex.multiplyScalar(pushDistance));
                        newPositions.set([extruded.x, extruded.y, extruded.z], (i + frontVertices.length) * 3);
                        newColors.set([glareColor.r, glareColor.g, glareColor.b, 0], (i + frontVertices.length) * 4);
                        const next = (i + 1) % frontVertices.length;
                        newIndices.push(i, next, i + frontVertices.length);
                        newIndices.push(next, next + frontVertices.length, i + frontVertices.length);
                    }
                    
                    glareGeometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
                    glareGeometry.setAttribute('color', new THREE.BufferAttribute(newColors, 4));
                    glareGeometry.setIndex(newIndices);
                    glareGeometry.attributes.position.needsUpdate = true;
                    glareGeometry.attributes.color.needsUpdate = true;
                }
            });

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

    </script>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '3d-design.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
