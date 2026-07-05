import { amountToWords } from "./amount-to-words";

function esc(v: string | null | undefined): string {
  if (!v) return "";
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmtDate(v?: string | null): string {
  if (!v) return "";
  const d = new Date(v);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getFullYear()).slice(2)}`;
}

function fmtNum(v: string | number | null | undefined): string {
  return parseFloat(String(v ?? 0)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export interface InvoicePdfData {
  invoice: {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string | null;
    dueDays: number | null;
    orderNo: string | null;
    agentName: string | null;
    transporterName: string | null;
    transportMode: string | null;
    vehicleNumber: string | null;
    lrNo: string | null;
    eWayBillNo: string | null;
    placeOfSupply: string | null;
    notes: string | null;
    terms: string | null;
    remark: string | null;
    interestRate: number | null;
    subtotal: number;
    discountAmount: number;
    freightCharges: number;
    taxableAmount: number;
    sgstRate: number;
    sgstAmount: number;
    cgstRate: number;
    cgstAmount: number;
    igstRate: number;
    igstAmount: number;
    grandTotal: number;
    bankName: string | null;
    bankAccountNo: string | null;
    bankIfsc: string | null;
    bankBranch: string | null;
    items: {
      id: string;
      description: string;
      hsnCode: string | null;
      pieces: number | null;
      quantity: number;
      rate: number;
      subtotal: number;
    }[];
    party: {
      name: string;
      gstin: string | null;
      panNo: string | null;
      phone: string | null;
      billingAddress1: string | null;
      billingAddress2: string | null;
      billingCity: string | null;
      billingState: string | null;
      billingStateCode: string | null;
      billingPostalCode: string | null;
      shippingAddress1: string | null;
      shippingAddress2: string | null;
      shippingCity: string | null;
      shippingState: string | null;
      shippingStateCode: string | null;
      shippingPostalCode: string | null;
    } | null;
  };
  challan: { challanNumber: string; issueDate: string } | null;
  company: {
    companyName: string;
    tagline: string | null;
    logoUrl: string | null;
    businessType: string | null;
    address1: string;
    address2: string | null;
    city: string;
    postalCode: string | null;
    phone: string | null;
    gstin: string;
    msme: string | null;
    state: string;
    stateCode: string;
    bankName: string | null;
    bankAccountNo: string | null;
    bankIfsc: string | null;
    bankBranch: string | null;
  } | null;
}

const DEFAULT_TERMS = `1. Payment to be made by A/c. Payee's cheque or demand draft only.
 2. Any complaint for the goods should be made within 15 days after that no complaint will be entertained.
 3. Interest @ 24% p.a. will be charged after the due date of the bill.
 4. We are not responsible for any loss or demage in transit.
 5. Goods once sold will not be taken back or replaced.
 6. Subject to SURAT Jurisdiction Only`;

export function buildInvoiceHtml(data: InvoicePdfData): string {
  const { invoice: inv, challan: ch, company: co } = data;
  const p = inv.party;
  const items = inv.items;

  const bankName = inv.bankName ?? co?.bankName ?? "";
  const bankAccountNo = inv.bankAccountNo ?? co?.bankAccountNo ?? "";
  const bankIfsc = inv.bankIfsc ?? co?.bankIfsc ?? "";
  const bankBranch = inv.bankBranch ?? co?.bankBranch ?? "";

  const totalPieces = items.reduce((s, it) => s + (it.pieces ?? 0), 0);
  const totalQty = items.reduce((s, it) => s + it.quantity, 0);
  const gt = inv.grandTotal;
  const interestPerDay = inv.interestRate ? (gt * inv.interestRate / 100 / 365).toFixed(2) : null;
  const netRate = totalQty > 0 ? (gt / totalQty).toFixed(3) : null;
  const hasSgst = inv.sgstAmount > 0;
  const hasCgst = inv.cgstAmount > 0;
  const hasIgst = inv.igstAmount > 0;
  const hasDiscount = inv.discountAmount > 0;
  const hasFreight = inv.freightCharges > 0;
  const amountRowSpan = 1 + ((hasSgst || hasCgst) ? 1 : 0) + (hasIgst ? 1 : 0);

  const bd = "1.7px solid #000";
  const font = "12px";
  const pad = "1px 3px";

  const itemRows = items.map((item, i) => `
    <tr>
      <td style="border-right:${bd};padding:${pad};font-size:13px;text-align:center;vertical-align:top">${i + 1}</td>
      <td style="border-right:${bd};padding:${pad};font-size:13px;vertical-align:top">${esc(item.description)}</td>
      <td style="border-right:${bd};padding:${pad};font-size:13px;text-align:right;vertical-align:top">${esc(item.hsnCode)}</td>
      <td style="border-right:${bd};padding:${pad};font-size:13px;text-align:right;vertical-align:top">${item.pieces ? fmtNum(item.pieces) : ""}</td>
      <td style="border-right:${bd};padding:${pad};font-size:13px;text-align:right;vertical-align:top">${fmtNum(item.quantity)}</td>
      <td style="border-right:${bd};padding:${pad};font-size:13px;text-align:right;vertical-align:top">${fmtNum(item.rate)}</td>
      <td style="padding:${pad};font-size:13px;text-align:right;vertical-align:top">${fmtNum(item.subtotal)}</td>
    </tr>
  `).join("");

  let gstRows = "";
  if (hasSgst && hasCgst) {
    gstRows = `
      <tr>
        <td colspan="3" style="border-top:${bd};border-right:${bd};padding:8px 4px 8px 8px;font-size:${font};vertical-align:top">
          <div style="padding:1px 0">SGST Amt @ ${inv.sgstRate.toFixed(2)} %</div>
          <div style="padding:1px 0">CGST Amt @ ${inv.cgstRate.toFixed(2)} %</div>
        </td>
        <td style="border-top:${bd};padding:8px 8px 8px 4px;font-size:${font};text-align:right;vertical-align:top">
          <div style="padding:1px 0">${fmtNum(inv.sgstAmount)}</div>
          <div style="padding:1px 0">${fmtNum(inv.cgstAmount)}</div>
        </td>
      </tr>`;
  } else if (hasSgst) {
    gstRows = `
      <tr>
        <td colspan="3" style="border-top:${bd};border-right:${bd};padding:3px 4px 3px 8px;font-size:${font};vertical-align:middle">SGST Amt @ ${inv.sgstRate.toFixed(2)} %</td>
        <td style="border-top:${bd};padding:3px 8px 3px 4px;font-size:${font};text-align:right;vertical-align:middle">${fmtNum(inv.sgstAmount)}</td>
      </tr>`;
  } else if (hasCgst) {
    gstRows = `
      <tr>
        <td colspan="3" style="border-top:${bd};border-right:${bd};padding:3px 4px 3px 8px;font-size:${font};vertical-align:middle">CGST Amt @ ${inv.cgstRate.toFixed(2)} %</td>
        <td style="border-top:${bd};padding:3px 8px 3px 4px;font-size:${font};text-align:right;vertical-align:middle">${fmtNum(inv.cgstAmount)}</td>
      </tr>`;
  }
  if (hasIgst) {
    gstRows += `
      <tr>
        <td colspan="3" style="border-top:${bd};border-right:${bd};padding:3px 4px 3px 8px;font-size:${font};vertical-align:middle">IGST Amt @ ${inv.igstRate.toFixed(2)} %</td>
        <td style="border-top:${bd};padding:3px 8px 3px 4px;font-size:${font};text-align:right;vertical-align:middle">${fmtNum(inv.igstAmount)}</td>
      </tr>`;
  }

  const logoHtml = co?.logoUrl ? `<img src="${co.logoUrl}" alt="Logo" style="max-width:150px;max-height:110px" />` : "";
  const taglineHtml = co?.tagline ? `<div style="font-size:10px;font-weight:600;margin-bottom:1px">${esc(co.tagline)}</div>` : "";
  const businessTypeHtml = co?.businessType ? `<div style="font-size:11px;margin-top:2px">${esc(co.businessType)}</div>` : "";
  const addressHtml = co ? `<div style="font-size:12px;margin-top:1px">${esc([co.address1, co.address2].filter(Boolean).join(", "))}</div>` : "";
  const cityHtml = co?.city ? `<div style="font-size:12px">${esc(co.city)}</div>` : "";
  const postalHtml = co?.postalCode ? `<div style="font-size:12px">${esc(co.postalCode)}</div>` : "";

  const phoneHtml = co?.phone ? `
    <div style="font-weight:700;font-size:10px">For Payment Collection</div>
    <div style="font-size:10.5px;font-weight:600;margin-top:1px">${esc(co.phone)}</div>` : "";

  const termsText = (inv.terms || DEFAULT_TERMS).replace(/\n/g, "<br/>");

  const netRateHtml = netRate ? `<b>Net Rate :</b>&ensp;${netRate}` : "";
  const interestHtml = interestPerDay ? `<b>Interest Amount Per Day :</b>&ensp;${interestPerDay}` : "";
  const spacer = netRate && interestPerDay ? '<span style="margin-left:30px"></span>' : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  @page { size: A4 portrait; margin: 0; }
  html, body { margin:0; padding:0; }
  .inv-page { width:210mm; height:297mm; padding:7mm 8mm; box-sizing:border-box; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
</style>
</head><body>
<div class="inv-page">
<table style="width:100%;height:100%;border-collapse:collapse;border:${bd};table-layout:fixed;font-family:'Times New Roman',Times,serif;font-size:${font};color:#000">
<colgroup>
  <col style="width:5%"/><col style="width:50%"/><col style="width:8%"/>
  <col style="width:6%"/><col style="width:9%"/><col style="width:7%"/><col style="width:15%"/>
</colgroup>
<tbody>

<!-- HEADER -->
<tr><td colspan="7" style="border-bottom:${bd};padding:6px 10px 8px">
  <div style="display:flex;align-items:flex-start;min-height:90px">
    <div style="width:15%;display:flex;flex-direction:column;align-items:flex-start">
      <div style="font-weight:700;font-size:11px;margin-bottom:4px">TAX INVOICE</div>
      ${logoHtml}
    </div>
    <div style="flex:1;text-align:center;padding-top:1px">
      ${taglineHtml}
      <div style="font-size:26px;font-weight:800;letter-spacing:0.5px;line-height:1.15">${esc(co?.companyName) || "TAX INVOICE"}</div>
      ${businessTypeHtml}${addressHtml}${cityHtml}${postalHtml}
    </div>
    <div style="width:18%;text-align:right;display:flex;flex-direction:column;align-self:stretch">
      <div style="font-size:10px">Original For Recipient</div>
      <div style="margin-top:auto">${phoneHtml}</div>
    </div>
  </div>
</td></tr>

<!-- GST / MSME / STATE -->
<tr><td colspan="7" style="border-bottom:${bd};padding:${pad};font-size:${font};position:relative">
  <b>GST No :</b>&ensp;${esc(co?.gstin?.toUpperCase())}
  <span style="position:absolute;left:42%;transform:translateX(-50%)"><b>MSME:</b>&ensp;${esc(co?.msme)}</span>
  <span style="float:right"><b>State :</b>&ensp;${co ? `${esc(co.stateCode)}-${esc(co.state)}` : ""}</span>
</td></tr>

<!-- ORDER / CHALLAN / INVOICE META -->
<tr><td colspan="7" style="padding:0"><div style="display:flex">
  <div style="width:34%;padding:${pad};font-size:${font}"><b>Order No:</b>&ensp;${esc(inv.orderNo)}</div>
  <div style="width:33%;padding:${pad};font-size:${font}"><b>Challan No:</b>&ensp;${esc(ch?.challanNumber)}</div>
  <div style="width:33%;padding:${pad};font-size:${font}"><b>Invoice No:</b>&ensp;<b style="font-size:11px">${esc(inv.invoiceNumber)}</b></div>
</div></td></tr>
<tr><td colspan="7" style="border-bottom:${bd};padding:0"><div style="display:flex">
  <div style="width:34%;padding:${pad};font-size:${font}"><b>Agent Name :</b>&ensp;${esc(inv.agentName)}</div>
  <div style="width:33%;padding:${pad};font-size:${font}"><b>Challan Date:</b>&ensp;${ch ? fmtDate(ch.issueDate) : ""}</div>
  <div style="width:33%;padding:${pad};font-size:${font}"><b>Invoice Date:</b>&ensp;${fmtDate(inv.issueDate)}</div>
</div></td></tr>
<tr><td colspan="7" style="padding:0"><div style="display:flex">
  <div style="width:34%;padding:${pad};font-size:${font}"><b>Transporter Name:</b>&ensp;${esc(inv.transporterName)}</div>
  <div style="width:33%;padding:${pad};font-size:${font}"><b>E Way Bill No :</b>&ensp;${esc(inv.eWayBillNo)}</div>
  <div style="width:33%;padding:${pad};font-size:${font}"><b>Vehicle No :</b>&ensp;${esc(inv.vehicleNumber)}</div>
</div></td></tr>
<tr><td colspan="7" style="border-bottom:${bd};padding:0"><div style="display:flex">
  <div style="width:34%;padding:${pad};font-size:${font}"><b>Transportation Mode:</b>&ensp;${esc(inv.transportMode)}</div>
  <div style="width:33%;padding:${pad};font-size:${font}"><b>LR No :</b>&ensp;${esc(inv.lrNo)}</div>
  <div style="width:33%;padding:${pad};font-size:${font}"><b>Place of Supply :</b>&ensp;${esc(inv.placeOfSupply)}</div>
</div></td></tr>

<!-- BILLED TO / SHIPPED TO -->
<tr><td colspan="7" style="border-bottom:${bd};padding:0"><div style="display:flex">
  <div style="width:50%;border-right:${bd};padding:4px 10px;line-height:1.55;font-size:${font}">
    <div><b>Billed to :</b></div>
    <div style="padding-left:8px">
      <div style="font-weight:600;font-size:11px;margin-top:1px">${esc(p?.name)}</div>
      ${p?.billingAddress1 ? `<div>${esc([p.billingAddress1, p.billingAddress2].filter(Boolean).join(", "))}</div>` : ""}
      ${p?.billingCity ? `<div>${esc(p.billingCity)}</div>` : ""}
      <div>${p?.billingPostalCode ? `Pincode: ${esc(p.billingPostalCode)}` : ""}${p?.phone ? ` Phone: ${esc(p.phone)}` : ""}</div>
    </div>
    <div style="display:flex">
      <span style="width:55%"><b>State Name :</b>&ensp;${esc(p?.billingState)}</span>
      <span><b>State Code :</b>&ensp;${esc(p?.billingStateCode)}</span>
    </div>
    <div style="display:flex">
      <span style="width:55%"><b>GST No :</b>&ensp;${esc(p?.gstin?.toUpperCase())}</span>
      <span><b>PAN No :</b>&ensp;${esc(p?.panNo)}</span>
    </div>
  </div>
  <div style="width:50%;padding:4px 10px;line-height:1.55;font-size:${font}">
    <div><b>Shipped to :</b></div>
    <div style="padding-left:8px">
      <div style="font-weight:600;font-size:11px;margin-top:1px">${esc(p?.name)}</div>
      ${p?.shippingAddress1 ? `<div>${esc([p.shippingAddress1, p.shippingAddress2].filter(Boolean).join(", "))}</div>` : ""}
      ${p?.shippingCity ? `<div>${esc(p.shippingCity)}</div>` : ""}
      ${p?.shippingPostalCode ? `<div>Pincode : ${esc(p.shippingPostalCode)}</div>` : ""}
    </div>
    <div style="display:flex">
      <span style="width:55%"><b>State Name :</b>&ensp;${esc(p?.shippingState)}</span>
      <span><b>State Code :</b>&ensp;${esc(p?.shippingStateCode)}</span>
    </div>
    <div><b>GST No :</b>&ensp;${esc(p?.gstin?.toUpperCase())}</div>
  </div>
</div></td></tr>

<!-- ITEMS HEADER -->
<tr style="background:#e8e8e8">
  <td style="border-right:${bd};border-bottom:${bd};padding:${pad};font-size:${font};font-weight:700;text-align:center">Sr No</td>
  <td style="border-right:${bd};border-bottom:${bd};padding:${pad};font-size:${font};font-weight:700">Item Name</td>
  <td style="border-right:${bd};border-bottom:${bd};padding:${pad};font-size:${font};font-weight:700;text-align:right">HSN/SAC</td>
  <td style="border-right:${bd};border-bottom:${bd};padding:${pad};font-size:${font};font-weight:700;text-align:right">Pieces</td>
  <td style="border-right:${bd};border-bottom:${bd};padding:${pad};font-size:${font};font-weight:700;text-align:right">Quantity</td>
  <td style="border-right:${bd};border-bottom:${bd};padding:${pad};font-size:${font};font-weight:700;text-align:right">Rate</td>
  <td style="border-bottom:${bd};padding:${pad};font-size:${font};font-weight:700;text-align:right">Amount</td>
</tr>
${itemRows}
<!-- filler row -->
<tr style="height:100%">
  <td style="border-right:${bd}">&nbsp;</td><td style="border-right:${bd}"></td><td style="border-right:${bd}"></td>
  <td style="border-right:${bd}"></td><td style="border-right:${bd}"></td><td style="border-right:${bd}"></td><td></td>
</tr>

<!-- BANK + GROSS / DISCOUNT / FREIGHT -->
<tr>
  <td colspan="3" rowspan="${hasFreight ? 3 : 2}" style="border-top:${bd};border-right:${bd};padding:4px 8px;font-size:${font};line-height:1.6;vertical-align:top">
    <div><b>Bank Name :</b>&ensp;${esc(bankName)}</div>
    <div><b>A/C No :</b>&ensp;${esc(bankAccountNo)}</div>
    <div><b>IFSC :</b>&ensp;${esc(bankIfsc)}</div>
    <div><b>Branch :</b>&ensp;${esc(bankBranch)}</div>
  </td>
  <td colspan="3" style="border-top:${bd};border-right:${bd};padding:3px 4px 3px 8px;font-size:${font}">Gross Amount</td>
  <td style="border-top:${bd};padding:3px 8px 3px 4px;font-size:${font};text-align:right">${fmtNum(inv.subtotal)}</td>
</tr>
<tr>
  <td colspan="3" style="${hasFreight ? "" : `border-bottom:${bd};`}border-right:${bd};padding:3px 4px 3px 8px;font-size:${font}">${hasDiscount ? "Discount" : " "}</td>
  <td style="${hasFreight ? "" : `border-bottom:${bd};`}padding:3px 8px 3px 4px;font-size:${font};text-align:right">${hasDiscount ? `-${fmtNum(inv.discountAmount)}` : " "}</td>
</tr>
${hasFreight ? `<tr>
  <td colspan="3" style="border-bottom:${bd};border-right:${bd};padding:3px 4px 3px 8px;font-size:${font}">Freight Charges</td>
  <td style="border-bottom:${bd};padding:3px 8px 3px 4px;font-size:${font};text-align:right">+${fmtNum(inv.freightCharges)}</td>
</tr>` : ""}

<!-- AMOUNT IN WORDS + TAXABLE / GST -->
<tr>
  <td colspan="3" rowspan="${amountRowSpan}" style="border-top:${bd};border-right:${bd};padding:4px 8px;font-size:16px;line-height:1.35;vertical-align:top">
    ${amountToWords(inv.grandTotal)}
  </td>
  <td colspan="3" style="border-right:${bd};padding:3px 4px 3px 8px;font-size:${font};vertical-align:middle">Taxable Amount</td>
  <td style="padding:3px 8px 3px 4px;font-size:${font};text-align:right;vertical-align:middle">${fmtNum(inv.taxableAmount)}</td>
</tr>
${gstRows}

<!-- NET RATE + INTEREST -->
<tr>
  <td colspan="3" style="border-top:${bd};border-right:${bd};padding:3px 8px;font-size:${font}">
    ${netRateHtml}${spacer}${interestHtml}
  </td>
  <td colspan="3" style="border-right:${bd}"></td><td></td>
</tr>

<!-- DUE DATE + TOTALS -->
<tr style="font-weight:700;font-size:${font}">
  <td colspan="3" style="border-top:${bd};padding:3px 8px">
    <b>Due Date :</b>&ensp;${inv.dueDate ? fmtDate(inv.dueDate) : ""}
    <span style="margin-left:14px"><b>Due Days:</b>&ensp;${inv.dueDays ?? ""}</span>
    <span style="float:right"><b>Totals :</b></span>
  </td>
  <td style="border-top:${bd};padding:${pad};text-align:right">${totalPieces > 0 ? fmtNum(totalPieces) : ""}</td>
  <td style="border-top:${bd};padding:${pad};text-align:right">${fmtNum(totalQty)}</td>
  <td style="border-top:${bd};padding:${pad}"></td>
  <td style="border-top:${bd};padding:${pad};text-align:right;font-size:13px;font-weight:800">₹&ensp;${fmtNum(gt)}</td>
</tr>

<!-- REMARK -->
<tr><td colspan="7" style="border-top:${bd};padding:3px 8px;font-size:${font}"><b>Remark :</b>&ensp;${esc(inv.remark)}</td></tr>

<!-- TERMS + RECEIVE -->
<tr>
  <td colspan="4" style="border-top:${bd};padding:4px 8px;line-height:1.45;font-size:${font};vertical-align:top">
    <div style="font-weight:700">Terms &amp; Conditions :</div>
    <div style="margin-top:1px">${termsText}</div>
  </td>
  <td colspan="3" style="border-top:${bd};padding:4px 8px;line-height:1.6;font-size:${font};vertical-align:top">
    <div><b>Receive Date:</b></div>
    <div><b>Receive Chq No:</b></div>
    <div><b>Receive Bank Name:</b></div>
    <div><b>Receive Amount:</b></div>
    ${co ? `<div style="text-align:right;font-weight:700;margin-top:14px;font-size:10px">For ${esc(co.companyName)}</div>` : ""}
  </td>
</tr>

<!-- SIGNATURES -->
<tr><td colspan="7" style="padding:0"><div style="display:flex">
  <div style="width:50%;padding-top:22px;padding-bottom:4px;padding-left:8px;font-size:${font}"><b>Receiver's Signature</b></div>
  <div style="width:50%;padding-top:22px;padding-bottom:4px;padding-right:8px;font-size:${font};text-align:right"><b>Authorised Signatory</b></div>
</div></td></tr>

</tbody></table>
</div>
</body></html>`;
}
