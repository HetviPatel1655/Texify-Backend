function esc(v: string | null | undefined): string {
  if (!v) return "";
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmtDate(v?: string | null): string {
  if (!v) return "";
  const d = new Date(v);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

interface RollEntry { serialNumber: number; meters: number }

interface ChallanItem {
  description: string;
  rollEntries: RollEntry[];
}

export interface ChallanPdfData {
  challan: {
    sequenceNumber: number;
    issueDate: string;
    agentName: string | null;
    remark: string | null;
    vehicleNumber: string | null;
    notes: string | null;
    totalTakas: number;
    totalMeters: number;
    deliveryPartyName: string | null;
    deliveryAddress1: string | null;
    deliveryAddress2: string | null;
    deliveryCity: string | null;
    deliveryState: string | null;
    deliveryGstin: string | null;
    party: {
      name: string;
      gstin: string | null;
      phone: string | null;
      billingAddress1: string | null;
      billingAddress2: string | null;
      billingCity: string | null;
      billingState: string | null;
    } | null;
    items: ChallanItem[];
  };
  company: {
    companyName: string;
    address1: string;
    address2: string | null;
    city: string;
    phone: string | null;
    gstin: string;
  } | null;
  rowsPerColumn: number;
  duplicate: boolean;
}

const DEFAULT_NOTE = "(1) NO DYEING GUARANTEE. (2) Complaint if any regarding this Challan must be settled within 24 hours. (3) No guarantee is given for Length, Width &amp; Weight. (4) Received the above goods in good and sound condition.";
const B = "1.7px solid #000";
const FONT = "'Times New Roman', Times, serif";

function buildRollGrid(entries: RollEntry[], rowsPerColumn: number, compact?: boolean): string {
  const numCols = Math.max(1, Math.ceil(entries.length / rowsPerColumn));
  const columns: RollEntry[][] = [];
  for (let c = 0; c < numCols; c++) {
    columns.push(entries.slice(c * rowsPerColumn, (c + 1) * rowsPerColumn));
  }

  const pairW = 100 / numCols;
  const srW = pairW * 0.35;
  const mW = pairW * 0.65;

  const colGroupCols = columns.map(() =>
    `<col style="width:${srW}%"/><col style="width:${mW}%"/>`
  ).join("");

  const hPad = "2px 10px 2px 4px";
  const hPadL = "2px 4px 2px 8px";

  const headerCells = columns.map(() =>
    `<th style="border-top:${B};border-bottom:${B};border-left:${B};padding:${hPadL};text-align:left;font-weight:bold">Sr. No.</th>
     <th style="border-top:${B};border-bottom:${B};border-right:${B};padding:${hPad};text-align:right;font-weight:bold">Meters</th>`
  ).join("");

  let bodyRows = "";
  for (let ri = 0; ri < rowsPerColumn; ri++) {
    const cells = columns.map(group => {
      const entry = group[ri];
      return `<td style="border-left:${B};padding:1px 4px 1px 8px">${entry ? entry.serialNumber : " "}</td>
              <td style="border-right:${B};padding:1px 10px 1px 4px;text-align:right">${entry ? entry.meters.toFixed(2) : " "}</td>`;
    }).join("");
    bodyRows += `<tr${compact ? ' style="line-height:1.2"' : ""}>${cells}</tr>`;
  }

  const footCells = columns.map(group => {
    const total = group.reduce((s, e) => s + e.meters, 0);
    return `<td style="border-left:${B};padding:2px 4px 2px 8px">&nbsp;</td>
            <td style="border-top:${B};border-bottom:${B};border-right:${B};padding:2px 10px 2px 4px;text-align:right;font-weight:bold">${total.toFixed(2)}</td>`;
  }).join("");

  return `<table style="width:100%;border-collapse:collapse;border:${B};font-size:12px;table-layout:fixed;print-color-adjust:exact;-webkit-print-color-adjust:exact">
    <colgroup>${colGroupCols}</colgroup>
    <thead><tr style="background-color:#eee">${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
    <tfoot><tr style="font-weight:bold">${footCells}</tr></tfoot>
  </table>`;
}

function buildSingleChallan(data: ChallanPdfData, compact?: boolean): string {
  const { challan: ch, company: co } = data;
  const party = ch.party;
  const firstItem = ch.items[0];
  const rollEntries = firstItem?.rollEntries ?? [];
  const companyAddr = esc([co?.address1, co?.address2, co?.city].filter(Boolean).join(", "));
  const noteInline = esc(ch.notes) || DEFAULT_NOTE;

  const partyAddr = esc([party?.billingAddress1, party?.billingAddress2].filter(Boolean).join(", "));
  const partyCityLine = esc([party?.billingCity, party?.billingState].filter(Boolean).join(" "));

  const delAddr = esc([
    ch.deliveryAddress1 || party?.billingAddress1,
    ch.deliveryAddress2 || party?.billingAddress2,
  ].filter(Boolean).join(", "));
  const delCityLine = esc([
    ch.deliveryCity || party?.billingCity,
    ch.deliveryState || party?.billingState,
  ].filter(Boolean).join(" "));

  const pad = compact ? "2px 6px" : "4px 6px";

  const rollGridHtml = rollEntries.length > 0
    ? `<div style="margin-top:-1px">${buildRollGrid(rollEntries, data.rowsPerColumn, compact)}</div>`
    : "";

  return `<div style="font-family:${FONT};font-size:12px;color:#000;line-height:${compact ? 1.35 : 1.4}">
    <div style="font-weight:bold;font-size:15px">Delivery Challan</div>
    <div style="text-align:center;font-size:24px;font-weight:bold;letter-spacing:2px">${esc(co?.companyName)}</div>
    <div style="text-align:center;font-size:12px;width:100%">${companyAddr}</div>
    <div style="display:flex;font-size:12px;margin-top:${compact ? "0px" : "2px"}">
      <span style="flex:1"><b>Phone :</b>&nbsp;${esc(co?.phone)}</span>
      <span style="flex:1;text-align:center;font-weight:bold">${esc(co?.city)}</span>
      <span style="flex:1">&nbsp;</span>
    </div>
    <div style="font-size:12px;margin-bottom:${compact ? "0px" : "2px"}"><b>GST No :</b>&nbsp;&nbsp;${esc(co?.gstin?.toUpperCase())}</div>

    <table style="width:100%;border-collapse:collapse;border:${B};font-size:12px"><tbody><tr>
      <td style="border:${B};padding:${compact ? "3px 6px" : pad};vertical-align:top;width:40%">
        <div><b>Party :</b>&nbsp;&nbsp;<b>${esc(party?.name)}</b></div>
        ${partyAddr ? `<div>${partyAddr},</div>` : ""}
        ${partyCityLine ? `<div>${partyCityLine}${party?.phone ? ` Phone: ${esc(party.phone)}` : ""}</div>` : ""}
        <div style="margin-top:${compact ? "2px" : "4px"}"><b>GST No :</b>&nbsp;&nbsp;<b>${esc(party?.gstin?.toUpperCase())}</b></div>
      </td>
      <td style="border:${B};padding:${compact ? "3px 6px" : pad};vertical-align:top;width:35%">
        <div><b>Delivery at :</b>&nbsp;&nbsp;<b>${esc(ch.deliveryPartyName ?? party?.name)}</b></div>
        ${delAddr ? `<div>${delAddr},</div>` : ""}
        ${delCityLine ? `<div>${delCityLine}</div>` : ""}
        <div style="margin-top:${compact ? "2px" : "4px"}"><b>GST No :</b>&nbsp;&nbsp;<b>${esc((ch.deliveryGstin ?? party?.gstin)?.toUpperCase())}</b></div>
      </td>
      <td style="border:${B};padding:${compact ? "3px 6px" : pad};vertical-align:top;width:25%">
        <div><b>Challan No :</b>&nbsp;&nbsp;<b>${String(ch.sequenceNumber).padStart(3, "0")}</b></div>
        <div><b>Challan Date :</b>&nbsp;&nbsp;${fmtDate(ch.issueDate)}</div>
        ${ch.agentName ? `<div><b>Broker Name :</b>&nbsp;&nbsp;${esc(ch.agentName)}</div>` : ""}
      </td>
    </tr></tbody></table>

    ${rollGridHtml}

    <table style="width:100%;border-collapse:collapse;border:${B};font-size:12px;margin-top:-1px"><tbody>
      ${firstItem ? `<tr><td colspan="2" style="border-bottom:${B};padding:${compact ? "2px 6px" : "3px 6px"}">
        <b>Item:</b>&nbsp;&nbsp;&nbsp;&nbsp;${esc(firstItem.description)}
        <span style="margin-left:40px"><b>Total Takas :</b>&nbsp;&nbsp;&nbsp;&nbsp;${ch.totalTakas}</span>
        <span style="margin-left:40px"><b>Total Meters :</b>&nbsp;&nbsp;&nbsp;&nbsp;${ch.totalMeters.toFixed(2)}</span>
      </td></tr>` : ""}
      <tr>
        <td style="border-bottom:${B};padding:2px 6px;width:50%"><b>Remark :</b>&nbsp;${esc(ch.remark)}</td>
        <td style="border-bottom:${B};padding:2px 6px;width:50%"><b>VehicleNo :</b>&nbsp;${esc(ch.vehicleNumber)}</td>
      </tr>
      <tr><td colspan="2" style="padding:${compact ? "3px 6px" : "4px 6px"};font-size:12px;line-height:${compact ? 1.35 : 1.5}"><b>Note :</b> ${noteInline}</td></tr>
    </tbody></table>

    <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:${compact ? "10px" : "20px"};padding:0 10px">
      <div style="display:flex;align-items:flex-end"><b>Receiver's Signature</b><span style="border-bottom:1px solid #000;width:180px;display:inline-block;margin-left:8px">&nbsp;</span></div>
      <div style="display:flex;align-items:flex-end"><b>Prepared by</b><span style="border-bottom:1px solid #000;width:180px;display:inline-block;margin-left:8px">&nbsp;</span></div>
    </div>
  </div>`;
}

export function buildChallanHtml(data: ChallanPdfData): string {
  const rollCount = data.challan.items[0]?.rollEntries?.length ?? 0;
  const needsPageBreak = data.duplicate && rollCount > 15;
  const compact = data.duplicate && !needsPageBreak;

  const single = buildSingleChallan(data, compact);

  let duplicateSection = "";
  if (data.duplicate) {
    if (needsPageBreak) {
      duplicateSection = `<div style="page-break-before:always">${buildSingleChallan(data)}</div>`;
    } else {
      duplicateSection = `<div style="border-top:2px dashed #999;margin:2px 0"></div>${buildSingleChallan(data, true)}`;
    }
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  @page { size: A4 portrait; margin: 6mm 8mm; }
  html, body { margin:0; padding:0; }
  table { box-sizing: border-box; }
</style>
</head><body style="font-family:${FONT}">
${single}
${duplicateSection}
</body></html>`;
}
