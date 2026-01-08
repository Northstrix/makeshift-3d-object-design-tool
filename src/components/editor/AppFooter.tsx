"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NamerUiBadge from "./NamerUiBadge";

    const creditsMarkdown = `
[Three.js Particle Morphing + GLSL Shaders](https://codepen.io/VoXelo/pen/QwWzwgQ) by [Techartist](https://codepen.io/VoXelo)

[GradientGen](https://github.com/noegarsoux/GradientGen) by [noegarsoux](https://github.com/noegarsoux)

[WebGL Doom Glare](https://github.com/michaeldll/webgl-doom-glare) by [Michael](https://github.com/michaeldll)

[three.js](https://github.com/mrdoob/three.js) by [mrdoob](https://github.com/mrdoob)

[Brushed Metal](https://codepen.io/simurai/pen/kvyEeg) by [simurai](https://codepen.io/simurai)

[Electric Lorenz Attractor](https://codepen.io/VoXelo/pen/gbrXozL) by [Techartist](https://codepen.io/VoXelo)

[Color Picker](https://21st.dev/community/components/uplusion23/color-picker/color-picker-with-swatches-and-onchange) by [Trevor McIntire](https://21st.dev/community/uplusion23)

[Lucide React](https://www.npmjs.com/package/lucide-react)

[Tabler Icons](https://github.com/tabler/tabler-icons)

[radix-ui](https://www.npmjs.com/package/radix-ui)

[Input Floating Label animation](https://codepen.io/Mahe76/pen/qBQgXyK) by [Elpeeda](https://codepen.io/Mahe76)

[すりガラスなプロフィールカード](https://codepen.io/ash_creator/pen/zYaPZLB) by [あしざわ - Webクリエイター](https://codepen.io/ash_creator)

[Neon Button](https://codepen.io/HighFlyer/pen/WNXRZBv) by [Thea](https://codepen.io/HighFlyer)`;

function renderEntry(entry: string) {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(entry)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{entry.slice(lastIndex, match.index)}</span>);
    }
    let label = match[1];
    parts.push(
      <a
        key={key++}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {label}
      </a>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < entry.length) {
    parts.push(<span key={key++}>{entry.slice(lastIndex)}</span>);
  }
  return parts;
}

const creditEntries = creditsMarkdown
  .trim()
  .split("\n")
  .map((e) => e.trim())
  .filter(Boolean);

export function AppFooter() {
  return (
    <footer className="text-center text-muted-foreground mt-4 border-border flex flex-col items-center gap-6">
      <Card className="bg-transparent border-0 shadow-none text-left">
        <CardHeader>
          <CardTitle>Credit & Info</CardTitle>
          <CardDescription>
            The existence of this project wouldn't have been possible without the following:
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4 h-auto">
          <ul
            style={{
              listStyleType: "none",
              padding: 0,
              margin: 0,
              lineHeight: 1.25,
              fontSize: "1rem",
            }}
          >
            {creditEntries.map((entry, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: idx === creditEntries.length - 1 ? 0 : 20,
                  wordWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {renderEntry(entry)}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <NamerUiBadge poweredByText="Powered by" namerUIName="Namer UI" />
      
       <div className="flex items-center justify-center gap-4 text-sm">
        <a
          href="https://sourceforge.net/p/makeshift-3d-object-designer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          SourceForge
        </a>
        <a
          href="https://github.com/Northstrix/makeshift-3d-object-design-tool"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          GitHub
        </a>
      </div>

      <div
        style={{
          lineHeight: 1.45,
        }}
      className="text-sm px-4">
        <p className="break-words">
          Made by{" "}
          <a
            href="https://maxim-bortnikov.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Maxim Bortnikov
          </a>
        </p>
        <p className="break-words">
          using{" "}
          <a
            href="https://nextjs.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Next.js
          </a>{" "}
          and{" "}
          <a
            href="https://firebase.studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Firebase Studio
          </a>
        </p>
      </div>
    </footer>
  );
}
