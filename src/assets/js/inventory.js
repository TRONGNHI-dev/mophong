import * as bootstrap from "bootstrap";
import { bizpracApi } from "./bizprac-api.js";

const openSessionsBtn = document.getElementById("active-sessions-btn");
const sessionsModal = document.getElementById("sessionsModal");
const sessionsModalSpinner = document.getElementById("sessionsModalSpinner");
const sessionsModalError = document.getElementById("sessionsModalError");
const sessionsModalBody = document.getElementById("sessionsModalBody");
const sessionsModalEmpty = document.getElementById("sessionsModalEmpty");
const sessionsModalTableBody = document.getElementById("sessionsModalTableBody");
const detailModal = document.getElementById("detailModal");
const detailModalTitle = document.getElementById("detailModalLabel");
const detailModalDescription = document.getElementById("detailModalDescription");
const detailModalList = document.getElementById("detailModalList");
const detailModalError = document.getElementById("detailModalError");
const detailModalSpinner = document.getElementById("detailModalSpinner");
const inventoryModal = document.getElementById("inventoryModal");
const inventoryModalLabel = document.getElementById("inventoryModalLabel");
const inventoryModalStatus = document.getElementById("inventoryModalStatus");
const inventoryTableBody = document.getElementById("inventoryTableBody");
const inventoryModalError = document.getElementById("inventoryModalError");
const inventoryModalEmpty = document.getElementById("inventoryModalEmpty");
const inventoryFormContainer = document.getElementById("inventoryFormContainer");
const inventoryForm = document.getElementById("inventoryForm");
const inventoryNewBtn = document.getElementById("inventoryNewBtn");
const inventoryCancelBtn = document.getElementById("inventoryCancelBtn");
const inventoryItemId = document.getElementById("inventoryItemId");
const inventoryItemCode = document.getElementById("inventoryItemCode");
const inventoryItemName = document.getElementById("inventoryItemName");
const inventoryItemType = document.getElementById("inventoryItemType");
const inventoryItemUnit = document.getElementById("inventoryItemUnit");
const inventoryItemStatus = document.getElementById("inventoryItemStatus");
const inventoryCurrentStock = document.getElementById("inventoryCurrentStock");
const inventoryMinimumStock = document.getElementById("inventoryMinimumStock");
const inventoryMaximumStock = document.getElementById("inventoryMaximumStock");
const inventoryUnitCost = document.getElementById("inventoryUnitCost");
const inventoryExpiryDate = document.getElementById("inventoryExpiryDate");

const sessionsModalInstance = sessionsModal ? new bootstrap.Modal(sessionsModal) : null;
const detailModalInstance = detailModal ? new bootstrap.Modal(detailModal) : null;
const inventoryModalInstance = inventoryModal ? new bootstrap.Modal(inventoryModal) : null;

const DETAIL_DATA = {
  "active-shifts": {
    title: "Chi tiết ca đang hoạt động",
    description: "Danh sách các quán và xưởng hiện đang hoạt động trong mô phỏng.",
    items: [
      "Quán Cafe 1 - Khu trung tâm",
      "Quán Cafe 2 - Khu văn phòng",
      "Quán Cafe 3 - Khu khuôn viên",
      "Quán Cafe 4 - Khu sinh viên",
      "Quán Cafe 5 - Khu thương mại",
      "Quán Cafe 6 - Khu tự chọn",
      "Quán Cafe 7 - Trung tâm dịch vụ",
      "Quán Cafe 8 - Khu ăn uống",
      "Quán Cafe 9 - Khu hội nghị",
      "Quán Cafe 10 - Khu quảng trường",
      "Xưởng 1 - Sản xuất nguyên liệu",
      "Xưởng 2 - Hệ thống đóng gói",
      "Xưởng 3 - Lắp ráp sản phẩm",
      "Xưởng 4 - Kiểm tra chất lượng",
      "Xưởng 5 - Kho vận chuyển",
      "Xưởng 6 - Quản lý logistics",
      "Xưởng 7 - In ấn và đóng gói",
      "Xưởng 8 - Vận hành tự động"
    ]
  },
  "stock-alerts": {
    title: "Chi tiết cảnh báo tồn kho",
    description: "Các mục tồn kho có cảnh báo và cần xử lý ngay.",
    items: [
      "Thép tấm ST-02 - Thiếu 30kg",
      "Hộp đóng gói A - Còn 540 bộ, cần bổ sung trong 2 ngày",
      "Linh kiện C-15 - Còn 120 bộ, cảnh báo giới hạn tối thiểu",
      "Đường trắng D-10 - Còn 5kg, nguy cơ thiếu trong ca tới",
      "Cà phê hạt R-01 - Còn 8 gói, cần đặt thêm",
      "Kem tươi S-04 - Còn 3 lít, cần nhập khẩn",
      "Ly giấy M-07 - Còn 120 chiếc, nguy cơ thiếu khi tăng ca"
    ]
  },
  "completion-rate": {
    title: "Chi tiết tỷ lệ hoàn thành",
    description: "Hiệu suất hoàn thành mô phỏng theo nhóm và các điểm cần cải thiện.",
    items: [
      "Nhóm QTC N1: Hoàn thành 93% - tốc độ ổn định.",
      "Nhóm Kinh Doanh 2: Hoàn thành 90% - cần cải thiện phối hợp.",
      "Nhóm Sản Xuất 3: Hoàn thành 88% - 2 lệnh gần trễ.",
      "Nhóm Dịch Vụ 4: Hoàn thành 92% - có 1 cảnh báo khách hàng.",
      "Nhóm Hỗ Trợ 5: Hoàn thành 89% - cần tăng tốc phản hồi."
    ]
  },
  "support-groups": {
    title: "Chi tiết nhóm cần hỗ trợ",
    description: "Các nhóm hiện đang cần trợ giúp vì chậm tiến độ hoặc lỗi thao tác.",
    items: [
      "Nhóm A: Thiếu nhân sự phục vụ, chậm so với kế hoạch.",
      "Nhóm B: Lỗi thao tác trong thay đổi đơn hàng.",
      "Nhóm C: Thiếu phối hợp giữa thu ngân và pha chế.",
      "Nhóm D: Chậm nhận đơn và xử lý khi cao điểm.",
      "Nhóm E: Cần hướng dẫn thêm về quy trình QR/pos."
    ]
  }
};

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderSessionRow(session) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${session.title || "Không rõ"}</td>
    <td>${session.simulation_name || "Chưa xác định"}</td>
    <td>${session.scenario_title || "Chưa chọn"}</td>
    <td>${session.classroom_name || "Chưa chọn"}</td>
    <td>${session.status ? session.status : "Unknown"}</td>
    <td>${formatDateTime(session.start_at)}</td>
  `;

  return tr;
}

function showLoading() {
  sessionsModalSpinner.classList.remove("d-none");
  sessionsModalError.classList.add("d-none");
  sessionsModalBody.classList.add("d-none");
  sessionsModalEmpty.classList.add("d-none");
}

function showError(message) {
  sessionsModalSpinner.classList.add("d-none");
  sessionsModalBody.classList.add("d-none");
  sessionsModalEmpty.classList.add("d-none");
  sessionsModalError.textContent = message;
  sessionsModalError.classList.remove("d-none");
}

function showSessions(sessions) {
  sessionsModalSpinner.classList.add("d-none");
  sessionsModalError.classList.add("d-none");

  const activeSessions = sessions.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status.includes("active") || status.includes("running") || status.includes("đang") || status === "open";
  });

  const list = activeSessions.length > 0 ? activeSessions : sessions;

  sessionsModalTableBody.innerHTML = "";
  if (list.length === 0) {
    sessionsModalBody.classList.add("d-none");
    sessionsModalEmpty.classList.remove("d-none");
    return;
  }

  sessionsModalBody.classList.remove("d-none");
  sessionsModalEmpty.classList.add("d-none");

  list.forEach((session) => {
    sessionsModalTableBody.appendChild(renderSessionRow(session));
  });
}

async function loadSessionDetails() {
  if (!sessionsModal || !sessionsModalTableBody) {
    return;
  }

  showLoading();

  try {
    const sessions = await bizpracApi.getSessions();
    showSessions(sessions);
  } catch (error) {
    showError(error.message || "Không thể tải dữ liệu phiên.");
  }
}

function renderDetailList(detail) {
  detailModalTitle.textContent = detail.title;
  detailModalDescription.textContent = detail.description;
  detailModalList.innerHTML = "";
  detail.items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = item;
    detailModalList.appendChild(li);
  });
}

function openDetailModal(key) {
  const detail = DETAIL_DATA[key];
  if (!detail || !detailModalInstance) {
    return;
  }

  detailModalError.classList.add("d-none");
  detailModalSpinner.classList.add("d-none");
  renderDetailList(detail);
  detailModalInstance.show();
}

function renderInventoryRow(item) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${item.item_code || "-"}</td>
    <td>${item.item_name || "-"}</td>
    <td>${item.unit || "-"}</td>
    <td>${Number(item.current_stock).toLocaleString("vi-VN")}</td>
    <td>${Number(item.minimum_stock).toLocaleString("vi-VN")}</td>
    <td><span class="badge ${getStatusBadgeClass(item.status)}">${formatStatusLabel(item.status)}</span></td>
    <td>
      <button type="button" class="btn btn-sm btn-outline-primary me-1 inventory-edit-btn" data-id="${item.id}">Sửa</button>
      <button type="button" class="btn btn-sm btn-outline-danger inventory-delete-btn" data-id="${item.id}">Xóa</button>
    </td>
  `;
  return tr;
}

function getStatusBadgeClass(status) {
  switch ((status || "").toLowerCase()) {
    case "low_stock":
      return "bg-warning-subtle text-warning";
    case "out_of_stock":
      return "bg-danger-subtle text-danger";
    case "expired":
      return "bg-secondary-subtle text-secondary";
    default:
      return "bg-success-subtle text-success";
  }
}

function formatStatusLabel(status) {
  switch ((status || "").toLowerCase()) {
    case "low_stock":
      return "Thiếu";
    case "out_of_stock":
      return "Hết";
    case "expired":
      return "Hết hạn";
    default:
      return "Bình thường";
  }
}

function showInventoryStatus(message) {
  if (!inventoryModalStatus) return;
  inventoryModalStatus.textContent = message;
}

function showInventoryError(message) {
  if (!inventoryModalError) return;
  inventoryModalError.textContent = message;
  inventoryModalError.classList.remove("d-none");
}

function hideInventoryError() {
  if (!inventoryModalError) return;
  inventoryModalError.classList.add("d-none");
}

function resetInventoryForm() {
  inventoryFormContainer.classList.add("d-none");
  inventoryForm.reset();
  inventoryItemId.value = "";
}

function fillInventoryForm(item) {
  inventoryItemId.value = item.id;
  inventoryItemCode.value = item.item_code;
  inventoryItemName.value = item.item_name;
  inventoryItemType.value = item.item_type;
  inventoryItemUnit.value = item.unit;
  inventoryItemStatus.value = item.status;
  inventoryCurrentStock.value = item.current_stock;
  inventoryMinimumStock.value = item.minimum_stock;
  inventoryMaximumStock.value = item.maximum_stock || "";
  inventoryUnitCost.value = item.unit_cost || "";
  inventoryExpiryDate.value = item.expiry_date ? new Date(item.expiry_date).toISOString().split("T")[0] : "";
  inventoryFormTitle.textContent = "Sửa mục tồn kho";
  inventoryFormContainer.classList.remove("d-none");
}

function openInventoryFormForCreate() {
  inventoryFormTitle.textContent = "Thêm mục tồn kho";
  inventoryFormContainer.classList.remove("d-none");
  inventoryForm.reset();
  inventoryItemId.value = "";
  inventoryItemStatus.value = "low_stock";
}

async function fetchInventoryItems() {
  if (!inventoryTableBody) return;
  hideInventoryError();
  inventoryTableBody.innerHTML = "";
  inventoryModalEmpty.classList.add("d-none");
  showInventoryStatus("Đang tải danh sách mục tồn kho...");

  try {
    const items = await bizpracApi.getInventoryItems();
    if (!items || items.length === 0) {
      inventoryModalEmpty.classList.remove("d-none");
      showInventoryStatus("Không có mục tồn kho.");
      return;
    }

    items.forEach((item) => {
      inventoryTableBody.appendChild(renderInventoryRow(item));
    });
    showInventoryStatus(`Tổng ${items.length} mục tồn kho`);
  } catch (error) {
    showInventoryError(error.message || "Không thể tải dữ liệu tồn kho.");
    showInventoryStatus("");
  }
}

async function openInventoryModal() {
  if (!inventoryModalInstance) return;
  resetInventoryForm();
  hideInventoryError();
  inventoryModalEmpty.classList.add("d-none");
  await fetchInventoryItems();
  inventoryModalInstance.show();
}

async function deleteInventoryItem(id) {
  if (!confirm("Bạn có chắc muốn xóa mục này không?")) {
    return;
  }
  try {
    await bizpracApi.deleteInventoryItem(id);
    await fetchInventoryItems();
  } catch (error) {
    showInventoryError(error.message || "Xóa mục thất bại.");
  }
}

async function submitInventoryForm(event) {
  event.preventDefault();
  hideInventoryError();
  const payload = {
    itemCode: inventoryItemCode.value.trim(),
    itemName: inventoryItemName.value.trim(),
    itemType: inventoryItemType.value,
    unit: inventoryItemUnit.value.trim(),
    currentStock: parseFloat(inventoryCurrentStock.value) || 0,
    minimumStock: parseFloat(inventoryMinimumStock.value) || 0,
    maximumStock: inventoryMaximumStock.value ? parseFloat(inventoryMaximumStock.value) : null,
    unitCost: inventoryUnitCost.value ? parseFloat(inventoryUnitCost.value) : 0,
    expiryDate: inventoryExpiryDate.value || null,
    status: inventoryItemStatus.value
  };

  try {
    if (inventoryItemId.value) {
      await bizpracApi.updateInventoryItem(inventoryItemId.value, payload);
    } else {
      await bizpracApi.createInventoryItem(payload);
    }
    resetInventoryForm();
    await fetchInventoryItems();
  } catch (error) {
    showInventoryError(error.message || "Lưu mục thất bại.");
  }
}

const inventoryFormTitle = document.getElementById("inventoryFormTitle");

if (inventoryNewBtn) {
  inventoryNewBtn.addEventListener("click", openInventoryFormForCreate);
}

if (inventoryCancelBtn) {
  inventoryCancelBtn.addEventListener("click", resetInventoryForm);
}

if (inventoryForm) {
  inventoryForm.addEventListener("submit", submitInventoryForm);
}

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.matches(".inventory-edit-btn")) {
    const id = target.dataset.id;
    try {
      const items = await bizpracApi.getInventoryItems();
      const item = items.find((i) => String(i.id) === String(id));
      if (item) {
        fillInventoryForm(item);
      }
    } catch (error) {
      showInventoryError(error.message || "Không thể tải dữ liệu mục.");
    }
  }
  if (target.matches(".inventory-delete-btn")) {
    const id = target.dataset.id;
    await deleteInventoryItem(id);
  }
});

const inventoryDetailButton = document.querySelector(".detail-button[data-detail-key=stock-inventory]");
if (inventoryDetailButton) {
  inventoryDetailButton.addEventListener("click", openInventoryModal);
}

if (openSessionsBtn && sessionsModalInstance) {
  openSessionsBtn.addEventListener("click", async () => {
    sessionsModalInstance.show();
    await loadSessionDetails();
  });
}

const detailButtons = document.querySelectorAll(".detail-button");
if (detailButtons.length > 0) {
  detailButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.detailKey;
      if (key === "stock-inventory") {
        return;
      }
      openDetailModal(key);
    });
  });
}
