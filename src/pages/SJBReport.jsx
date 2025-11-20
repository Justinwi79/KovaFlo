import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { generateSjbPdf } from "../utils/pdf/sjbPdf";

/* ---------------- Validation Schemas ---------------- */
const CrewSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
});

const EquipmentSchema = z.object({
  type: z.string().trim().min(1, "Required"),
  qty: z.string().trim().optional(),
});

const PipeSchema = z.object({
  size: z.string().trim().min(1, "Required"),
  ptype: z.string().trim().min(1, "Required"),
  footage: z.string().trim().optional(),
  serial: z.string().trim().optional(),
});

const MaterialSchema = z.object({
  item: z.string().trim().min(1, "Required"),
  spec: z.string().trim().optional(),
  qty: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const PhotoSchema = z.object({
  name: z.string(),
  dataUrl: z.string(),
  w: z.number().optional(),
  h: z.number().optional(),
  caption: z.string().optional(),
});

const ynna = z.enum(["Y", "N", "NA", "NO"]);
const LineItemSchema = z.object({
  label: z.string(),
  ref: z.string().optional(),
  val: ynna.optional(),
});

const FormSchema = z.object({
  projectName: z.string().trim().min(1, "Project is required"),
  client: z.string().trim().optional(),     // keeps key; now labeled Operator / Contractor
  clientRep: z.string().trim().optional(),  // keeps key; now labeled Operator/Contractor Rep
  inspector: z.string().trim().min(1, "Inspector is required"),
  date: z.string().trim().min(1, "Date is required"),
  location: z.string().trim().optional(),

  weather: z.string().trim().optional(),
  temp: z.string().trim().optional(),
  wind: z.string().trim().optional(),
  precip: z.string().trim().optional(),

  crew: z.array(CrewSchema),
  equipment: z.array(EquipmentSchema),
  summary: z.string().trim().min(1, "Work summary is required"),
  pipes: z.array(PipeSchema),
  materials: z.array(MaterialSchema),

  secSafety: z.array(LineItemSchema),
  secPermits: z.array(LineItemSchema),
  secGeneral: z.array(LineItemSchema),
  secPlastic: z.array(LineItemSchema),
  secValves: z.array(LineItemSchema),
  secDamage: z.array(LineItemSchema),
  secMeter: z.array(LineItemSchema),
  secBackfill: z.array(LineItemSchema),
  secRecords: z.array(LineItemSchema),

  photos: z.array(PhotoSchema).default([]),
});

/* ---------------- Default Values ---------------- */
const DEFAULTS = {
  projectName: "",
  client: "",        // Operator / Contractor (label only)
  clientRep: "",     // Operator/Contractor Rep (label only)
  inspector: "",
  date: format(new Date(), "yyyy-MM-dd"),
  location: "",

  weather: "",
  temp: "",
  wind: "",
  precip: "",

  crew: [{ name: "", company: "", role: "" }],
  equipment: [{ type: "", qty: "" }],
  summary: "",
  pipes: [{ size: "", ptype: "", footage: "", serial: "" }],
  materials: [],

  secSafety: [
    { label: "JSA Form/Report Completed Each Day" },
    { label: "Emergency Contact List on Site Each Day" },
    { label: "Identified any specific site Hazards? (If yes see comments)" },
    { label: "Identified any AOC’s for reporting week? (If yes see comments)" },
    { label: "All Employees had Appropriate PPE?" },
    { label: "Traffic Safety Plan in Place each day?" },
    { label: "Contractor had Competent Person On-Site each day?" },
    { label: "Any documented Near Misses for reporting week? (If yes see comments)" },
    { label: "Inspector had copy of all equipment certification documents?" },
    { label: "TWIC Card Required" },
    { label: "Stop work authority executed? (If yes see comments)" },
  ],
  secPermits: [{ label: "LA – DOTD Highway" }, { label: "Parish" }, { label: "EPA/Wetland" }],
  secGeneral: [
    { label: "Inspector performed post-construction leak survey using laser leak detector", ref: "192.303-192.329" },
    { label: "All general construction practices met DOT/Operator requirements?" },
    { label: "Appropriate purging procedures followed for purging of air?", ref: "192.629(a)" },
    { label: "Abandonment/Deactivation of Facilities followed operator procedures?", ref: "192.727" },
  ],
  secPlastic: [
    { label: "Inspector witnessed fusion of PE pipe components (socket/butt/electro-fusion)" },
    { label: "Persons performing fusion signed & dated adjacent pipe" },
    { label: "Inspector documented & reported discrepancies (bad joints, depth, tracer wire, etc.)" },
    { label: "Inspector verified tracer wire with low-frequency locator (~512 Hz)" },
  ],
  secValves: [
    { label: "All valves open; hand holes set; stems centered; holes clear of debris" },
    { label: "At completion of phase, all valves verified open" },
  ],
  secDamage: [
    { label: "Pipeline markers/signs correctly placed per operator specs/standards", ref: "192.707(a)" },
    { label: "Signs/markers have correct contact & damage prevention info", ref: "192.707(d)(2)" },
    { label: "Temporary locate flags/paint placed on top of new pipe" },
  ],
  secMeter: [
    { label: "Meters & service regulators installed per regs/operator specs", ref: "192.353-357" },
    { label: "Service lines installed per regs/operator specs", ref: "192.361-381" },
    { label: "Service lines tested before being placed in service", ref: "192.511-517" },
  ],
  secBackfill: [
    { label: "Open trenches/bell holes properly barricaded if left open overnight" },
    { label: "Proper shoring of trenches/bore pits; worker protection in install/tie-in/purge" },
    { label: "Trench line backfilled adequately" },
    { label: "Erosion control measures taken on trench line" },
    { label: "Construction debris cleared from job site" },
    { label: "Construction damage to property repaired" },
    { label: "Repairs made to concrete cuts/driveways" },
    { label: "Temporary facilities for test gauges/bleed-down removed" },
  ],
  secRecords: [
    { label: "Employee Qualification/Certification records current for project", ref: "192.807" },
    { label: "As-built drawings completed for daily work" },
    { label: "As-built for service lines include excess flow valves" },
    { label: "GIS/Pipe fitting data collected by Inspector or Operator" },
    { label: "Pressure test charts completed, signed by witness" },
    { label: "Verified sampling/measurements of as-builts" },
  ],
  photos: [],
};

/* Merge draft & defaults */
function getInitialValues() {
  const draft = loadDraft();
  const pick = (key) =>
    draft && Array.isArray(draft[key]) && draft[key].length ? draft[key] : DEFAULTS[key];
  return {
    ...DEFAULTS,
    ...(draft || {}),
    crew: pick("crew"),
    equipment: pick("equipment"),
    pipes: pick("pipes"),
    materials: pick("materials"),
    secSafety: pick("secSafety"),
    secPermits: pick("secPermits"),
    secGeneral: pick("secGeneral"),
    secPlastic: pick("secPlastic"),
    secValves: pick("secValves"),
    secDamage: pick("secDamage"),
    secMeter: pick("secMeter"),
    secBackfill: pick("secBackfill"),
    secRecords: pick("secRecords"),
    photos: pick("photos"),
  };
}

export default function SJBReport() {
  const [logoDataUrl, setLogoDataUrl] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        setLogoDataUrl(c.toDataURL("image/png"));
      } catch {}
    };
    img.src = "/kovaflo-logo.png";
  }, []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: getInitialValues(),
    mode: "onBlur",
  });

  const crewArray = useFieldArray({ control, name: "crew" });
  const equipArray = useFieldArray({ control, name: "equipment" });
  const pipeArray = useFieldArray({ control, name: "pipes" });
  const matArray = useFieldArray({ control, name: "materials" });

  const safetyArray = useFieldArray({ control, name: "secSafety" });
  const permitsArray = useFieldArray({ control, name: "secPermits" });
  const generalArray = useFieldArray({ control, name: "secGeneral" });
  const plasticArray = useFieldArray({ control, name: "secPlastic" });
  const valvesArray = useFieldArray({ control, name: "secValves" });
  const damageArray = useFieldArray({ control, name: "secDamage" });
  const meterArray = useFieldArray({ control, name: "secMeter" });
  const backfillArray = useFieldArray({ control, name: "secBackfill" });
  const recordsArray = useFieldArray({ control, name: "secRecords" });

  const [photosState, setPhotosState] = useState(() => getInitialValues().photos || []);

  const values = watch();
  useEffect(() => {
    const t = setTimeout(() => saveDraft(values), 600);
    return () => clearTimeout(t);
  }, [values]);

  function onExport(data) {
    return generateSjbPdf(data, logoDataUrl);
  }

  function onClear() {
    reset(DEFAULTS);
    localStorage.removeItem("sjb-daily-draft");
    setPhotosState([]);
    setValue("photos", [], { shouldDirty: true });
  }

  const projTitle = useMemo(() => (values.projectName || "SJB Report"), [values.projectName]);

  return (
    <div className="min-h-screen bg-[#F9FBFD] text-gray-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-[#D0E8F0]">
        <nav className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 select-none">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#004581] to-[#019ABD]" />
            <span className="text-lg font-extrabold text-[#004581]">
              Kova<span className="text-[#019ABD]">Flo</span>
            </span>
          </a>
          <a href="/" className="px-3 py-2 rounded-xl text-[#004581] hover:bg-[#E6F0F4]">Home</a>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-[#004581]">{projTitle}</h1>
          <p className="text-sm text-gray-600">SJBGroup Daily/Weekly Inspection Report</p>
        </div>

        <form onSubmit={handleSubmit(onExport)} className="grid gap-6">
          {/* Project */}
          <Section title="Project">
            <Grid cols={3}>
              <Field label="Project Name *" error={errors.projectName?.message}>
                <input className="input" {...register("projectName")} placeholder="e.g., Line 42 Rehab" />
              </Field>
              <Field label="Operator / Contractor">
                <input className="input" {...register("client")} placeholder="e.g., Atmos / Prime Contractor" />
              </Field>
              <Field label="Operator/Contractor Rep (sign-off)">
                <input className="input" {...register("clientRep")} placeholder="Jane Smith" />
              </Field>
              <Field label="Inspector *" error={errors.inspector?.message}>
                <input className="input" {...register("inspector")} placeholder="Your Name" />
              </Field>
              <Field label="Date *" error={errors.date?.message}>
                <input className="input" type="date" {...register("date")} />
              </Field>
              <Field label="Location">
                <input className="input" {...register("location")} placeholder="Parish / City / GPS" />
              </Field>
            </Grid>
          </Section>

          {/* Weather */}
          <Section title="Weather">
            <Grid cols={4}>
              <Field label="Conditions">
                <input className="input" {...register("weather")} placeholder="Sunny / Overcast / Rain" />
              </Field>
              <Field label="Temperature (°F)">
                <input className="input" {...register("temp")} placeholder="78" />
              </Field>
              <Field label="Wind">
                <input className="input" {...register("wind")} placeholder="5 mph NNE" />
              </Field>
              <Field label="Precipitation">
                <input className="input" {...register("precip")} placeholder="None / Light / Heavy" />
              </Field>
            </Grid>
          </Section>

          {/* Crew */}
          <Section title="Crew">
            <div className="space-y-3">
              {crewArray.fields.map((f, idx) => (
                <div key={f.id} className="grid md:grid-cols-3 gap-3">
                  <input className="input" placeholder="Name *" {...register(`crew.${idx}.name`)} />
                  <input className="input" placeholder="Company" {...register(`crew.${idx}.company`)} />
                  <div className="flex gap-2">
                    <input className="input flex-1" placeholder="Role" {...register(`crew.${idx}.role`)} />
                    <button type="button" onClick={() => crewArray.remove(idx)} className="btn-secondary">Remove</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => crewArray.append({ name: "", company: "", role: "" })} className="btn">+ Add Crew Member</button>
            </div>
          </Section>

          {/* Equipment */}
          <Section title="Equipment Used">
            <div className="space-y-3">
              {equipArray.fields.map((f, idx) => (
                <div key={f.id} className="grid md:grid-cols-3 gap-3">
                  <input className="input md:col-span-2" placeholder="Equipment Type * (e.g., Excavator, Holiday Detector)" {...register(`equipment.${idx}.type`)} />
                  <div className="flex gap-2">
                    <input className="input flex-1" placeholder="Qty" {...register(`equipment.${idx}.qty`)} />
                    <button type="button" onClick={() => equipArray.remove(idx)} className="btn-secondary">Remove</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => equipArray.append({ type: "", qty: "" })} className="btn">+ Add Equipment</button>
            </div>
          </Section>

          {/* Work Summary */}
          <Section title="Work Summary">
            <textarea className="input w-full min-h-[160px]" placeholder="Describe activities, locations, tests, safety notes…"
              {...register("summary")} />
            {errors.summary?.message && <p className="err">{errors.summary.message}</p>}
          </Section>

          {/* Pipe Installed */}
          <Section title="Pipe Installed">
            <div className="space-y-3">
              {pipeArray.fields.map((f, idx) => (
                <div key={f.id} className="grid md:grid-cols-4 gap-3">
                  <input className="input" placeholder='Size * (e.g., 6")' {...register(`pipes.${idx}.size`)} />
                  <input className="input" placeholder="Type * (e.g., HDPE)" {...register(`pipes.${idx}.ptype`)} />
                  <input className="input" placeholder="Footage (e.g., 230’)" {...register(`pipes.${idx}.footage`)} />
                  <div className="flex gap-2">
                    <input className="input flex-1" placeholder="Serial #" {...register(`pipes.${idx}.serial`)} />
                    <button type="button" onClick={() => pipeArray.remove(idx)} className="btn-secondary">Remove</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => pipeArray.append({ size: "", ptype: "", footage: "", serial: "" })} className="btn">+ Add Pipe Row</button>
            </div>
          </Section>

          {/* Materials / Fittings */}
          <Section title="Materials / Fittings Used">
            <div className="space-y-3">
              {matArray.fields.map((f, idx) => (
                <div key={f.id} className="grid md:grid-cols-4 gap-3">
                  <input className="input" placeholder="Item *" {...register(`materials.${idx}.item`)} />
                  <input className="input" placeholder="Spec / Size" {...register(`materials.${idx}.spec`)} />
                  <input className="input" placeholder="Qty" {...register(`materials.${idx}.qty`)} />
                  <div className="flex gap-2">
                    <input className="input flex-1" placeholder="Notes" {...register(`materials.${idx}.notes`)} />
                    <button type="button" onClick={() => matArray.remove(idx)} className="btn-secondary">Remove</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => matArray.append({ item: "", spec: "", qty: "", notes: "" })} className="btn">+ Add Item</button>
            </div>
          </Section>

          {/* Checkbox Sections */}
          <CheckSection title="2 • Jobsite Safety Awareness / Knowledge" name="secSafety"  arr={safetyArray}  register={register} cols={["Y","N"]} />
          <CheckSection title="3 • Jobsite Permits"                 name="secPermits" arr={permitsArray} register={register} cols={["Y","N","NA","NO"]} />
          <CheckSection title="4 • General Construction Practices"  name="secGeneral" arr={generalArray} register={register} cols={["Y","N"]} />
          <CheckSection title="5 • Plastic Pipe Installation"       name="secPlastic" arr={plasticArray} register={register} cols={["Y","N","NA","NO"]} />
          <CheckSection title="6 • Distribution Line Valves"        name="secValves"  arr={valvesArray}  register={register} cols={["Y","N","NA","NO"]} />
          <CheckSection title="7 • Damage Prevention"               name="secDamage"  arr={damageArray}  register={register} cols={["Y","N","NA","NO"]} />
          <CheckSection title="8 • Meter Set Installed"             name="secMeter"   arr={meterArray}   register={register} cols={["Y","N","NA","NO"]} />
          <CheckSection title="9 • Job Site / Back Fill"            name="secBackfill"arr={backfillArray}register={register} cols={["Y","N","NA","NO"]} />
          <CheckSection title="10 • Records"                        name="secRecords" arr={recordsArray} register={register} cols={["Y","N","NA","NO"]} />

          {/* Photos */}
          <PhotosSection
            photos={photosState}
            setPhotos={(arr) => {
              setPhotosState(arr);
              setValue("photos", arr, { shouldDirty: true });
            }}
          />

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-1">
            <button type="submit" disabled={isSubmitting} className="btn">
              {isSubmitting ? "Generating PDF…" : "Export PDF"}
            </button>
            <button type="button" onClick={() => saveDraft(values)} className="btn-secondary">Save Draft</button>
            <button type="button" onClick={onClear} className="btn-secondary">Clear</button>
          </div>

          <p className="text-xs text-gray-500">Drafts autosave locally. PDF is generated in-browser and never leaves this device.</p>
        </form>
      </main>
    </div>
  );
}

function CheckSection({ title, name, arr, register, cols = ["Y","N"], labels = { Y:"Yes", N:"No", NA:"N/A", NO:"N/O" } }) {
  return (
    <Section title={title}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#004581]">
              <th className="py-2 pr-3">Description</th>
              {cols.map((code) => (
                <th key={code} className="py-2 px-2 whitespace-nowrap">
                  {labels[code] ?? code}
                </th>
              ))}
              <th className="py-2 px-2">Ref</th>
            </tr>
          </thead>
          <tbody>
            {arr.fields.map((f, idx) => (
              <tr key={f.id} className="border-t border-[#D0E8F0]">
                <td className="py-2 pr-3">{f.label}</td>
                {cols.map((code) => (
                  <td key={code} className="py-2 px-2">
                    <input type="radio" className="h-4 w-4 align-middle" value={code} {...register(`${name}.${idx}.val`)} />
                  </td>
                ))}
                <td className="py-2 px-2 text-gray-500">{f.ref || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function PhotosSection({ photos, setPhotos }) {
  async function fileToDataUrl(file) {
    const maxDim = 1600;
    const imgDataUrl = await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
    const image = await new Promise((res) => {
      const i = new Image();
      i.onload = () => res(i);
      i.src = imgDataUrl;
    });
    const { width, height } = image;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    if (scale < 1) {
      const c = document.createElement("canvas");
      c.width = Math.round(width * scale);
      c.height = Math.round(height * scale);
      const ctx = c.getContext("2d");
      ctx.drawImage(image, 0, 0, c.width, c.height);
      return { dataUrl: c.toDataURL("image/jpeg", 0.85), w: c.width, h: c.height };
    }
    return { dataUrl: imgDataUrl, w: width, h: height };
  }

  async function onPick(e) {
    const files = Array.from(e.target.files || []);
    const processed = [];
    for (const f of files) {
      if (!/^image\//.test(f.type)) continue;
      const { dataUrl, w, h } = await fileToDataUrl(f);
      processed.push({ name: f.name, dataUrl, w, h, caption: "" });
    }
    setPhotos([...(photos || []), ...processed]);
    e.target.value = "";
  }

  function removeAt(i) {
    const next = (photos || []).slice();
    next.splice(i, 1);
    setPhotos(next);
  }

  function setCaption(i, val) {
    const next = (photos || []).slice();
    next[i] = { ...next[i], caption: val };
    setPhotos(next);
  }

  return (
    <Section title="Photos">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="btn cursor-pointer">
            + Add Photos
            <input type="file" accept="image/*" multiple onChange={onPick} className="hidden" />
          </label>
          <p className="text-sm text-gray-600">JPEG/PNG. Large images are auto-downscaled to keep PDFs lean.</p>
        </div>

        {!photos?.length ? (
          <p className="text-sm text-gray-500">No photos added yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((p, i) => (
              <div key={i} className="border border-[#D0E8F0] rounded-lg overflow-hidden">
                <img src={p.dataUrl} alt={p.name} className="w-full h-36 object-cover" />
                <div className="p-2 space-y-2">
                  <div className="text-xs text-gray-600 truncate">{p.name}</div>
                  <input className="input" placeholder="Caption (optional)" value={p.caption || ""} onChange={(e) => setCaption(i, e.target.value)} />
                  <button type="button" onClick={() => removeAt(i)} className="btn-secondary w-full">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

/* ---------------- UI Helpers & styles ---------------- */
function Section({ title, children, wide = false }) {
  return (
    <section className={`${wide ? "-mx-6 md:-mx-8 lg:-mx-12" : ""} rounded-2xl border border-[#D0E8F0] bg-white p-6 shadow-sm`}>
      <h2 className="text-lg font-semibold text-[#004581] mb-4">{title}</h2>
      {children}
    </section>
  );
}
function Grid({ cols = 2, children }) {
  const cls = cols === 4 ? "grid grid-cols-1 md:grid-cols-4 gap-3"
    : cols === 3 ? "grid grid-cols-1 md:grid-cols-3 gap-3"
    : "grid grid-cols-1 md:grid-cols-2 gap-3";
  return <div className={cls}>{children}</div>;
}
function Field({ label, error, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-[#004581]">{label}</span>
      {children}
      {error && <span className="err">{error}</span>}
    </label>
  );
}

const css = `
.input { @apply w-full px-3 py-2 rounded-md border border-[#D0E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#019ABD]; }
.btn { @apply inline-flex items-center h-10 px-4 rounded-2xl bg-[#004581] text-white font-semibold hover:bg-[#019ABD]; }
.btn-secondary { @apply inline-flex items-center h-10 px-3 rounded-2xl border border-[#D0E8F0] text-[#004581] font-semibold hover:bg-[#F1F7FA]; }
.err { @apply text-sm text-red-700; }
`;
if (typeof document !== "undefined" && !document.getElementById("sjb-inline-css")) {
  const style = document.createElement("style");
  style.id = "sjb-inline-css";
  style.innerHTML = css;
  document.head.appendChild(style);
}

/* ---------------- Local draft storage ---------------- */
function saveDraft(values) {
  try { localStorage.setItem("sjb-daily-draft", JSON.stringify(values)); } catch {}
}
function loadDraft() {
  try { const raw = localStorage.getItem("sjb-daily-draft"); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
