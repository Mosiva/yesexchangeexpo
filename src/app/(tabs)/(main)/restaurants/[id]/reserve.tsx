import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Circle, G, Line, Rect, Svg, Text as SvgText } from "react-native-svg";

type Status = "free" | "held" | "reserved";
type Shape = "clover4" | "oval6" | "long" | "booth"; // типы столов

type Table = {
  id: string;
  label: string;
  status: Status;
  shape: Shape;
  // позиция и базовые размеры в координатах viewBox
  x: number; y: number; w?: number; h?: number; r?: number;
};

const COLOR = { free: "#2ecc71", held: "#f1c40f", reserved: "#e74c3c" };

// ---------- отрисовка фигур ----------
function Clover4({ x, y, r, fill, label }:{x:number;y:number;r:number;fill:string;label:string}) {
  const d = r * 0.65;
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={fill}/>
      {/* 4 сиденья по сторонам */}
      <Circle cx={x}     cy={y-r-10} r={r*0.28} fill="#3f3f3f"/>
      <Circle cx={x}     cy={y+r+10} r={r*0.28} fill="#3f3f3f"/>
      <Circle cx={x-r-10} cy={y}     r={r*0.28} fill="#3f3f3f"/>
      <Circle cx={x+r+10} cy={y}     r={r*0.28} fill="#3f3f3f"/>
      <SvgText x={x} y={y} fill="#fff" fontSize={r*0.9} fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">{label}</SvgText>
    </G>
  );
}

function Oval6({ x, y, w, h, fill, label }:{x:number;y:number;w:number;h:number;fill:string;label:string}) {
  const rx = Math.min(w,h)/2;
  return (
    <G>
      <Rect x={x-w/2} y={y-h/2} width={w} height={h} rx={rx*0.6} ry={rx*0.6} fill={fill}/>
      {/* сиденья по 3 с каждой стороны */}
      {[-1,0,1].map((i)=>(
        <Circle key={`t${i}`} cx={x - w/2 - 12} cy={y + i*(h/3)} r={h*0.12} fill="#3f3f3f"/>
      ))}
      {[-1,0,1].map((i)=>(
        <Circle key={`r${i}`} cx={x + w/2 + 12} cy={y + i*(h/3)} r={h*0.12} fill="#3f3f3f"/>
      ))}
      <SvgText x={x} y={y} fill="#fff" fontSize={h*0.45} fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">{label}</SvgText>
    </G>
  );
}

function LongTable({ x,y,w,h,fill,label }:{x:number;y:number;w:number;h:number;fill:string;label?:string}) {
  return (
    <G>
      <Rect x={x-w/2} y={y-h/2} width={w} height={h} rx={10} ry={10} fill={fill}/>
      {/* стулья вокруг */}
      {Array.from({length:7}).map((_,i)=>(
        <Circle key={`l${i}`} cx={x - w/2 - 12} cy={y - h/2 + 18 + i*( (h-36)/6 )} r={9} fill="#7a7a7a"/>
      ))}
      {Array.from({length:7}).map((_,i)=>(
        <Circle key={`r${i}`} cx={x + w/2 + 12} cy={y - h/2 + 18 + i*( (h-36)/6 )} r={9} fill="#7a7a7a"/>
      ))}
      <Circle cx={x} cy={y + h/2 + 12} r={9} fill="#7a7a7a"/>
      <SvgText x={x} y={y} fill="#fff" fontSize={24} fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">{label ?? ""}</SvgText>
    </G>
  );
}

function Booth({ x,y,w,h,fill,label }:{x:number;y:number;w:number;h:number;fill:string;label?:string}) {
  return (
    <G>
      <Rect x={x-w/2} y={y-h/2} width={w} height={h} rx={6} ry={6} fill={fill}/>
      <SvgText x={x} y={y} fill="#fff" fontSize={14} fontWeight="600" textAnchor="middle" alignmentBaseline="middle">{label ?? ""}</SvgText>
    </G>
  );
}

// ---------- экран ----------
export default function Reserve() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();

  // viewBox — 1000x1400 (приблизительно как твой макет по вертикали)
  const plan = useMemo(()=>{
    const gray = "#4a4a4a";
    return {
      width: 1000, height: 1400,
      bar: { x: 520, y: 700, w: 260, h: 430, fill: gray }, // центральная серая стойка
      walls: [
        { x1: 310, y1: 180, x2: 310, y2: 1150 },
        { x1: 820, y1: 390, x2: 820, y2: 1080 },
      ],
      plants: [
        { x: 450, y: 480 }, { x: 690, y: 480 }
      ],
      tables: [
        // левый столбец: 6-местные овальные
        { id:"a1", label:"1",  status:"free" as Status,     shape:"oval6" as Shape,  x:160, y:330, w:210, h:110 },
        { id:"a2", label:"2",  status:"free" as Status,     shape:"oval6" as Shape,  x:160, y:510, w:210, h:110 },
        { id:"a3", label:"3",  status:"free" as Status,     shape:"oval6" as Shape,  x:160, y:690, w:210, h:110 },
        { id:"a4", label:"4",  status:"free" as Status,     shape:"oval6" as Shape,  x:160, y:870, w:210, h:110 },

        // рядом столбик клеверов на 4
        { id:"b1", label:"5",  status:"reserved" as Status, shape:"clover4" as Shape, x:300, y:360, r:48 },
        { id:"b2", label:"6",  status:"free" as Status,     shape:"clover4" as Shape, x:300, y:520, r:48 },
        { id:"b3", label:"7",  status:"reserved" as Status, shape:"clover4" as Shape, x:300, y:680, r:48 },
        { id:"b4", label:"8",  status:"free" as Status,     shape:"clover4" as Shape, x:300, y:840, r:48 },

        // верхний остров с большим столом
        { id:"c1", label:"31", status:"free" as Status,     shape:"long" as Shape,    x:520, y:250, w:230, h:120 },

        // возле бара слева и справа — ряды кловеров (с «V» у занятых на макете)
        { id:"d1", label:"9",  status:"reserved" as Status, shape:"clover4" as Shape, x:380, y:600, r:48 },
        { id:"d2", label:"10", status:"reserved" as Status, shape:"clover4" as Shape, x:380, y:710, r:48 },
        { id:"d3", label:"11", status:"free" as Status,     shape:"clover4" as Shape, x:380, y:820, r:48 },
        { id:"d4", label:"12", status:"reserved" as Status, shape:"clover4" as Shape, x:380, y:930, r:48 },

        { id:"e1", label:"13", status:"free" as Status,     shape:"clover4" as Shape, x:660, y:600, r:48 },
        { id:"e2", label:"14", status:"reserved" as Status, shape:"clover4" as Shape, x:660, y:710, r:48 },
        { id:"e3", label:"15", status:"free" as Status,     shape:"clover4" as Shape, x:660, y:820, r:48 },
        { id:"e4", label:"16", status:"reserved" as Status, shape:"clover4" as Shape, x:660, y:930, r:48 },

        // правый край — кабинки/диваны вертикально
        { id:"f1", label:"A", status:"free" as Status,     shape:"booth" as Shape, x:900, y:520, w:90,  h:90  },
        { id:"f2", label:"B", status:"free" as Status,     shape:"booth" as Shape, x:900, y:630, w:90,  h:90  },
        { id:"f3", label:"C", status:"free" as Status,     shape:"booth" as Shape, x:900, y:740, w:90,  h:90  },
        { id:"f4", label:"D", status:"free" as Status,     shape:"booth" as Shape, x:900, y:850, w:90,  h:90  },

        // низ — два больших стола-зоны
        { id:"g1", label:"223", status:"free" as Status,   shape:"long" as Shape,  x:400, y:1180, w:250, h:130 },
        { id:"g2", label:"221", status:"free" as Status,   shape:"long" as Shape,  x:600, y:1180, w:250, h:130 },
        { id:"g3", label:"11",  status:"free" as Status,   shape:"long" as Shape,  x:800, y:1180, w:220, h:110 },
      ],
    };
  }, []);

  const [tables, setTables] = useState<Table[]>(() => plan.tables);
  const [picked, setPicked] = useState<Table | null>(null);
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("");
  const [success, setSuccess] = useState(false);

  const onPick = (t: Table) => { if (t.status !== "reserved") setPicked(t); };

  const confirm = () => {
    if (!time.trim() || !guests.trim()) { Alert.alert("Заполните форму", "Укажите время и количество гостей"); return; }
    setTables(prev => prev.map(x => x.id === picked?.id ? { ...x, status: "held" } : x));
    setPicked(null); setTime(""); setGuests(""); setSuccess(true);
  };

  return (
    <View style={{flex:1, backgroundColor:"#111"}}>
      <Stack.Screen options={{ title: `Бронь ${name || ""}` }} />

      <Text style={{color:"#fff", fontSize:18, fontWeight:"600", padding:16}}>
        Выберите столик в {name || `баре #${id}`}
      </Text>

      <View style={styles.canvas}>
        <Svg viewBox={`0 0 ${plan.width} ${plan.height}`} width="100%" height="100%">
          {/* фон */}
          <Rect x={0} y={0} width={plan.width} height={plan.height} fill="#1e1e1e"/>

          {/* перегородки */}
          {plan.walls.map((w,i)=>(
            <Line key={i} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="#6b6b6b" strokeWidth={6}/>
          ))}

          {/* растения */}
          {plan.plants.map((p,i)=>(
            <G key={i}>
              <Circle cx={p.x} cy={p.y} r={50} fill="none" stroke="#7a7a7a" strokeDasharray="6 6"/>
              <Circle cx={p.x} cy={p.y} r={30} fill="none" stroke="#7a7a7a" strokeDasharray="6 6"/>
            </G>
          ))}

          {/* центральный бар/стойка */}
          <LongTable x={plan.bar.x} y={plan.bar.y} w={plan.bar.w} h={plan.bar.h} fill={plan.bar.fill} />

          {/* столы */}
          {tables.map((t) => (
            <G key={t.id} onPress={() => onPick(t)}>
              {t.shape === "clover4" && <Clover4 x={t.x} y={t.y} r={t.r || 50} fill={COLOR[t.status]} label={t.label}/>}
              {t.shape === "oval6"   && <Oval6   x={t.x} y={t.y} w={t.w || 210} h={t.h || 110} fill={COLOR[t.status]} label={t.label}/>}
              {t.shape === "long"    && <LongTable x={t.x} y={t.y} w={t.w || 230} h={t.h || 120} fill={COLOR[t.status]} label={t.label}/>}
              {t.shape === "booth"   && <Booth    x={t.x} y={t.y} w={t.w || 90}  h={t.h || 90}  fill={COLOR[t.status]} label={t.label}/>}
            </G>
          ))}
        </Svg>
      </View>

      {/* легенда */}
      <View style={styles.legend}>
        <Legend color="#2ecc71" label="Свободен"/>
        <Legend color="#f1c40f" label="Ожидает подтверждения"/>
        <Legend color="#e74c3c" label="Занят"/>
      </View>

      {/* форма выбора */}
      <Modal visible={!!picked} transparent animationType="fade" onRequestClose={()=>setPicked(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Стол {picked?.label}</Text>
            <Text style={styles.modalHint}>Укажите время и количество гостей</Text>
            <TextInput placeholder="20:00" value={time} onChangeText={setTime} style={styles.input} placeholderTextColor="#9aa"/>
            <TextInput placeholder="Количество гостей" value={guests} onChangeText={setGuests} keyboardType="number-pad" style={styles.input} placeholderTextColor="#9aa"/>
            <View style={styles.modalRow}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={()=>setPicked(null)}><Text style={styles.btnGhostText}>Отмена</Text></Pressable>
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={confirm}><Text style={styles.btnPrimaryText}>Подтвердить</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* успех */}
      <Modal visible={success} transparent animationType="fade" onRequestClose={()=>setSuccess(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Спасибо за выбор!</Text>
            <Text style={styles.modalHint}>Бар получил заявку и подтвердит бронь.</Text>
            <Pressable style={[styles.btn, styles.btnPrimary, {marginTop:10}]} onPress={()=>setSuccess(false)}>
              <Text style={styles.btnPrimaryText}>Ок</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Legend({ color, label }:{color:string;label:string}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot,{backgroundColor:color}]}/>
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, marginHorizontal: 12, marginBottom: 6, borderRadius: 12, overflow: "hidden" },
  legend: { flexDirection:"row", justifyContent:"center", gap:18, paddingVertical:10 },
  legendItem: { flexDirection:"row", alignItems:"center" },
  legendDot: { width:12, height:12, borderRadius:6, marginRight:6 },
  legendText: { color:"#ddd" },
  modalBg: { flex:1, backgroundColor:"rgba(0,0,0,0.6)", justifyContent:"center", alignItems:"center" },
  modalCard: { width:"84%", backgroundColor:"#1d1d1d", borderRadius:12, padding:16 },
  modalTitle: { color:"#fff", fontSize:18, fontWeight:"700" },
  modalHint: { color:"#9aa", marginTop:6, marginBottom:12 },
  input: { borderWidth:1, borderColor:"#3b3b3b", borderRadius:10, paddingVertical:10, paddingHorizontal:12, color:"#fff", marginBottom:10 },
  btn: { paddingVertical:10, paddingHorizontal:14, borderRadius:10 },
  btnGhost: { backgroundColor:"transparent", borderWidth:1, borderColor:"#6b7280" },
  btnGhostText: { color:"#ddd" },
  btnPrimary: { backgroundColor:"#4F7942" },
  btnPrimaryText: { color:"#fff", fontWeight:"700" },
  modalRow: { flexDirection:"row", justifyContent:"space-between", gap:12 },
});