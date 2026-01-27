import React from "react";
import { View } from "react-native";
import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Polygon,
    Polyline,
    Stop,
    Text as SvgText,
} from "react-native-svg";

type Props = {
    data: number[];
    trend: "up" | "down" | "same";
};

const WIDTH = 140;
const HEIGHT = 60;
const PADDING = 6;

export default function SparklineChart({ data, trend }: Props) {
    if (!Array.isArray(data) || data.length < 2) return null;

    // старое → новое
    const normalized = [...data].reverse();

    const min = Math.min(...normalized);
    const max = Math.max(...normalized);
    const range = max - min || 1;

    const color =
        trend === "up"
            ? "#16A34A"
            : trend === "down"
                ? "#DC2626"
                : "#9CA3AF";

    const arrow =
        trend === "up" ? "▲" : trend === "down" ? "▼" : "＝";

    const points = normalized.map((value, index) => {
        const x =
            (index / (normalized.length - 1)) * (WIDTH - PADDING * 2) + PADDING;

        const y =
            HEIGHT -
            ((value - min) / range) * (HEIGHT - PADDING * 2) -
            PADDING;

        return { x, y };
    });

    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");

    // ⬇️ polygon для area
    const areaPoints = [
        `${points[0].x},${HEIGHT - PADDING}`,
        ...points.map(p => `${p.x},${p.y}`),
        `${points[points.length - 1].x},${HEIGHT - PADDING}`,
    ].join(" ");

    const lastPoint = points[points.length - 1];

    return (
        <View style={{ width: WIDTH, height: HEIGHT }}>
            <Svg width={WIDTH} height={HEIGHT}>
                <Defs>
                    <LinearGradient
                        id="sparkGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <Stop offset="0%" stopColor={color} stopOpacity={0.35} />
                        <Stop offset="100%" stopColor={color} stopOpacity={0.05} />
                    </LinearGradient>
                </Defs>

                {/* area под линией */}
                <Polygon
                    points={areaPoints}
                    fill="url(#sparkGradient)"
                />

                {/* линия */}
                <Polyline
                    points={polylinePoints}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* точки */}
                {points.map((p, i) => {
                    const isLast = i === points.length - 1;

                    return (
                        <Circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r={isLast ? 4 : 3}
                            fill={isLast ? "#FFFFFF" : color}
                            stroke={color}
                            strokeWidth={isLast ? 1.5 : 0}
                        />
                    );
                })}

                {/* стрелка тренда */}
                <SvgText
                    x={lastPoint.x + 6}
                    y={lastPoint.y + 4}
                    fontSize="12"
                    fill={color}
                    fontWeight="700"
                >
                    {arrow}
                </SvgText>
            </Svg>
        </View>
    );
}