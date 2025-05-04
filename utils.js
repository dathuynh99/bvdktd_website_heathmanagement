// Để chạy được các hàm trong đây, chỉ cần thêm đoạn này vào đầu file HTML (trong thẻ <head>):
// <script src="utils.js"></script>

function checkCCCDAvailableYet() {

    inputCCCDnew = document.getElementById("CCCD").value.trim().replace(/^0+/, '');
    console.log("Input CCCD new:", inputCCCDnew);

    if (!window.dataArray || window.dataArray.length === 0) {
        Swal.fire("Lỗi", "Dữ liệu chưa được tải, vui lòng thử lại.", "error");
        return;
    }

    // Chuyển tất cả dữ liệu trong Google Sheets thành chuỗi để so sánh chính xác
    let normalizedData = window.dataArray.map(item => item.toString().trim());

    if (inputCCCDcurrent === inputCCCDnew) { }
    else {
        if (normalizedData.includes(inputCCCDnew)) {
            CCCDisexsist = true;
            Swal.fire("Thông báo", "Số CCCD này đã có trên hệ thống", "error");
        } else {
            CCCDisexsist = false;
            // Swal.fire("Thông báo", "Giá trị này chưa có trong Google Sheets.", "info");
        }
    }
}

// Hàm chỉ lấy tất cả giá trị ngưỡng để so sánh ở Google Sheet ------------------------------------------------------------------------------------------------------------------------------------------------
function getGiaTriNguong() {
    let url_nguong = `${scriptURL_nguong}?action=fetchdata`;
    fetch(url_nguong)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                Swal.fire("Thông báo", "Không tìm thấy dữ liệu.", "info");
                M.updateTextFields();
                return;
            }

            let userData = data[0];
            bmimin = userData[0].toString().replace('.', ',');
            bmimax = userData[1].toString().replace('.', ',');
            bloodpressuremin = userData[2];
            bloodpressuremax = userData[3];
            whitebloodcellmin = userData[4].toString().replace('.', ',');
            whitebloodcellmax = userData[5].toString().replace('.', ',');
            redbloodcellmin = userData[6].toString().replace('.', ',');
            redbloodcellmax = userData[7].toString().replace('.', ',');
            plateletmin = userData[8];
            plateletmax = userData[9];
            Glucosemin = userData[10].toString().replace('.', ',');
            Glucosemax = userData[11].toString().replace('.', ',');
            Uremin = userData[12].toString().replace('.', ',');
            Uremax = userData[13].toString().replace('.', ',');
            Creatininmin = userData[14].toString().replace('.', ',');
            Creatininmax = userData[15].toString().replace('.', ',');
            SGOTmin = userData[16].toString().replace('.', ',');
            SGOTmax = userData[17].toString().replace('.', ',');
            SGPTmin = userData[18].toString().replace('.', ',');
            SGPTmax = userData[19].toString().replace('.', ',');

            const logValues = {
                bmimin, bmimax, bloodpressuremin, bloodpressuremax,
                whitebloodcellmin, whitebloodcellmax, redbloodcellmin, redbloodcellmax,
                plateletmin, plateletmax, Glucosemin, Glucosemax,
                Uremin, Uremax, Creatininmin, Creatininmax,
                SGOTmin, SGOTmax, SGPTmin, SGPTmax
            };

            console.log("Min/Max Values:");
            for (const [key, value] of Object.entries(logValues)) {
                const maxKey = key.endsWith("min") ? key.replace("min", "max") : null;
                if (maxKey && logValues[maxKey]) {
                    console.log(`${key}: ${value}, ${maxKey}: ${logValues[maxKey]}`);
                }
            }
        })
        .catch(error => {
            console.error("Lỗi:", error);
            Swal.fire("Lỗi", "Đã xảy ra lỗi khi đánh giá sức khỏe.", "error");
        });
}

// Hàm chỉ lấy tất cả CCCD ở Google Sheet ------------------------------------------------------------------------------------------------------------------------------------------------
function getAllCCCDToArray() {
    showLoading();

    // Nếu đã có dữ liệu trong localStorage thì dùng luôn
    const cachedData = localStorage.getItem("cccdData");
    if (cachedData) {
        window.dataArray = JSON.parse(cachedData);
        console.log("Dữ liệu từ localStorage:", window.dataArray);
        console.log("Số lượng phần tử từ localStorage:", window.dataArray.length);
        hideLoading();
        return;
    }

    // Nếu chưa có thì gọi API để lấy
    let url = `${scriptURL}?action=checkcheckcccdavailable`;
    console.log("Gọi API với URL:", url); // Log URL để kiểm tra
    fetch(url)
        .then(response => {
            console.log("Phản hồi từ server:", response); // Kiểm tra phản hồi ban đầu
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.dataArray = data;
            console.log("Dữ liệu thô từ Google Sheets:", data); // Log dữ liệu thô
            console.log("Số lượng phần tử từ API:", data.length); // Log số lượng phần tử
            console.log("Kích thước dữ liệu (byte):", new Blob([JSON.stringify(data)]).size); // Kiểm tra kích thước

            localStorage.setItem("cccdData", JSON.stringify(data)); // Lưu tạm
            console.log("Dữ liệu đã lưu vào localStorage:", window.dataArray);
            hideLoading();
        })
        .catch(error => {
            console.error("Lỗi chi tiết:", error); // Log lỗi chi tiết
            Swal.fire("Lỗi", "Không thể tải dữ liệu CCCD hiện có. CCCD có thể trùng", "error");
            hideLoading();
        });
}

//  Khi gọi hàm này, nó sẽ xóa dữ liệu trong localStorage và gọi lại hàm getAllCCCDToArray để lấy dữ liệu mới
// localStorage.removeItem("cccdData");
// getAllCCCDToArray(); // gọi lại để lấy dữ liệu mới

// Hàm lấy tất cả CCCD và Họ Tên - CCCD ở Google Sheet ------------------------------------------------------------------------------------------------------------------------------------------------
function getAllDataOnLoad() {
    showLoading();

    // Kiểm tra dữ liệu đã có trong localStorage chưa
    const cachedCCCD = localStorage.getItem("cccdData");
    const cachedName = localStorage.getItem("nameData");

    // Nếu cả hai đều có, dùng luôn
    if (cachedCCCD && cachedName) {
        window.dataArray = JSON.parse(cachedCCCD);
        window.nameArray = JSON.parse(cachedName);

        console.log("✅ Dữ liệu CCCD từ localStorage:", window.dataArray);
        console.log("✅ Dữ liệu Tên từ localStorage:", window.nameArray);
        hideLoading();
        return;
    }

    // Nếu chưa có thì fetch từ Google Sheets
    const cccdURL = `${scriptURL}?action=checkcheckcccdavailable`;
    const nameURL = `${scriptURL}?action=checkchecknamevailable`;

    const fetchCCCD = fetch(cccdURL).then(res => res.json());
    const fetchName = fetch(nameURL).then(res => res.json());

    Promise.all([fetchCCCD, fetchName])
        .then(([cccdData, nameData]) => {
            window.dataArray = cccdData;
            window.nameArray = nameData;

            // Lưu vào localStorage để lần sau dùng lại
            localStorage.setItem("cccdData", JSON.stringify(cccdData));
            localStorage.setItem("nameData", JSON.stringify(nameData));

            console.log("✅ Dữ liệu CCCD từ API:", cccdData);
            console.log("✅ Dữ liệu Tên từ API:", nameData);
            hideLoading();
        })
        .catch(error => {
            console.error("❌ Lỗi khi lấy dữ liệu:", error);
            Swal.fire("Lỗi", "Không thể tải dữ liệu từ Google Sheets.", "error");
            hideLoading();
        });
}

// Khi gọi hàm này, nó sẽ xóa dữ liệu trong localStorage và gọi lại hàm getAllDataOnLoad để lấy dữ liệu mới
// localStorage.removeItem("cccdData");
// localStorage.removeItem("nameData");
// getAllDataOnLoad(); // gọi lại để lấy dữ liệu mới

// Hàm search trong search bar (Search theo CCCD và theo Tên) ------------------------------------------------------------------------------------------------------------------------------------------------
function removeVietnameseTones(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

document.addEventListener("click", function (event) {
    const container = document.querySelector(".search-container");
    const dropdown = document.getElementById("searchResults");

    if (!container.contains(event.target)) {
        dropdown.classList.remove("show");
    }
});

function searchCCCDDataInSearchBar(query) {
    const searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = "";
    searchResults.classList.remove("show"); // reset trước mỗi lần tìm

    const queryRaw = query.trim();
    const queryCleaned = queryRaw.toLowerCase();
    const queryNormalized = removeVietnameseTones(queryCleaned);

    if (queryCleaned === "") return;

    const cccdArray = window.dataArray || [];
    const nameArray = window.nameArray || [];
    const isNumber = /^\d+$/.test(queryRaw);

    let filtered = [];

    if (isNumber) {
        filtered = cccdArray
            .map(cccd => String(cccd).padStart(12, "0"))
            .filter(cccd => cccd.includes(queryRaw))
            .map(cccd => ({ type: "cccd", value: cccd }));
    } else {
        filtered = nameArray
            .filter(entry => removeVietnameseTones(entry.toLowerCase()).includes(queryNormalized))
            .map(entry => {
                const [name, cccd] = entry.split(" - ");
                return { type: "name", name, cccd: padCCCD(cccd) };
            });
    }

    if (filtered.length > 0) {
        filtered.slice(0, 5).forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.type === "name"
                ? `${item.name} - ${item.cccd}`
                : item.value;

            li.onclick = () => {
                showLoading();
                const fullCCCD = item.type === "cccd" ? item.value : item.cccd;
                const cleanCCCD = fullCCCD.replace(/^0+/, "");

                document.querySelector(".search-bar").value = fullCCCD;
                searchResults.classList.remove("show");

                fetch(`${scriptURL}?action=searchuser&query=${cleanCCCD}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.length > 0) {
                            const row = data[0];
                            const [, hoTen, khoaPhong, chucDanh, namSinh, sdt] = row;

                            showPopup("Thông tin nhân viên", `
                                <table style="width: 100%; text-align: left; border-collapse: collapse;">
                                    <tr><th>Họ tên</th><td>${hoTen}</td></tr>
                                    <tr><th>Khoa Phòng</th><td>${khoaPhong}</td></tr>
                                    <tr><th>Chức Danh</th><td>${chucDanh}</td></tr>
                                    <tr><th>Năm Sinh</th><td>${namSinh}</td></tr>
                                    <tr><th>SĐT</th><td>${sdt}</td></tr>
                                    <tr><th>CCCD</th><td>${fullCCCD}</td></tr>
                                </table>
                            `);
                            document.querySelector(".search-bar").value = "";
                        } else {
                            showPopup("Không tìm thấy", "Không có thông tin cho CCCD này.");
                        }
                        hideLoading();
                        searchResults.classList.remove("show");
                    })
                    .catch(err => {
                        console.error("Lỗi khi tìm CCCD:", err);
                        showPopup("Lỗi", "Không thể lấy dữ liệu chi tiết từ server.");
                        searchResults.classList.remove("show");
                    });
            };

            searchResults.appendChild(li);
        });

        // ✅ Show dropdown sau khi append
        searchResults.classList.add("show");

    } else {
        const li = document.createElement("li");
        li.textContent = "Không tìm thấy kết quả phù hợp";
        li.onclick = () => {
            document.querySelector(".search-bar").value = "";
            searchResults.classList.remove("show");
            showPopup("Không tìm thấy", "Không có dữ liệu phù hợp với từ khóa bạn nhập.");
        };
        searchResults.appendChild(li);
        searchResults.classList.add("show");
    }
}



function padCCCD(cccd) {
    return cccd.toString().padStart(12, "0");
}

function showPopup(title, content) {
    Swal.fire({
        title: title,
        html: content, // Dùng html để hỗ trợ <br>
        // icon: "info",
        // showCloseButton: true,
        confirmButtonColor: "#25a171",
        confirmButtonText: "Đóng",
        width: '400px',
        backdrop: false,
        allowOutsideClick: false
    });
}

// Hàm khởi chạy giá trị mặc định ngưỡng so sánh ------------------------------------------------------------------------------------------------------------------------------------------------
function saveDefaultData() {
    let bmimin = 18.5.toString().replace('.', ',');
    let bmimax = 24.9.toString().replace('.', ',');
    let bloodpressuremin = "90/60";
    let bloodpressuremax = "139/85";
    let whitebloodcellmin = 3.9.toString().replace('.', ',');
    let whitebloodcellmax = 10.9.toString().replace('.', ',');
    let redbloodcellmin = 4.2.toString().replace('.', ',');
    let redbloodcellmax = 6.1.toString().replace('.', ',');
    let plateletmin = 150;
    let plateletmax = 450;
    let Glucosemin = 3.9.toString().replace('.', ',');
    let Glucosemax = 5.6.toString().replace('.', ',');
    let Uremin = 2.5.toString().replace('.', ',');
    let Uremax = 7.5.toString().replace('.', ',');
    let Creatininmin = 61.9.toString().replace('.', ',');
    let Creatininmax = 114.9.toString().replace('.', ',');
    let SGOTmin = 0.1.toString().replace('.', ',');
    let SGOTmax = 39.9.toString().replace('.', ',');
    let SGPTmin = 0.1.toString().replace('.', ',');
    let SGPTmax = 39.9.toString().replace('.', ',');

    let url = `${scriptURL_admin}?action=savedefalutdata` +
        `&bmimin=${encodeURIComponent(bmimin)}` +
        `&bmimax=${encodeURIComponent(bmimax)}` +
        `&bloodpressuremin=${encodeURIComponent(bloodpressuremin)}` +
        `&bloodpressuremax=${encodeURIComponent(bloodpressuremax)}` +
        `&whitebloodcellmin=${encodeURIComponent(whitebloodcellmin)}` +
        `&whitebloodcellmax=${encodeURIComponent(whitebloodcellmax)}` +
        `&redbloodcellmin=${encodeURIComponent(redbloodcellmin)}` +
        `&redbloodcellmax=${encodeURIComponent(redbloodcellmax)}` +
        `&plateletmin=${encodeURIComponent(plateletmin)}` +
        `&plateletmax=${encodeURIComponent(plateletmax)}` +
        `&Glucosemin=${encodeURIComponent(Glucosemin)}` +
        `&Glucosemax=${encodeURIComponent(Glucosemax)}` +
        `&Uremin=${encodeURIComponent(Uremin)}` +
        `&Uremax=${encodeURIComponent(Uremax)}` +
        `&Creatininmin=${encodeURIComponent(Creatininmin)}` +
        `&Creatininmax=${encodeURIComponent(Creatininmax)}` +
        `&SGOTmin=${encodeURIComponent(SGOTmin)}` +
        `&SGOTmax=${encodeURIComponent(SGOTmax)}` +
        `&SGPTmin=${encodeURIComponent(SGPTmin)}` +
        `&SGPTmax=${encodeURIComponent(SGPTmax)}`;

    fetch(url)
        .then(response => response.text())
        .then(data => {
            // M.updateTextFields();
            // Hiển thị thông báo ở một vụ trí cố định trên web
            // document.getElementById("result").innerHTML = data;
        })
        .catch(error => console.error("Lỗi:", error));
}

// Hàm xóa input ở các trường nhập --------------------------------------------------------------------------------------------------------------------------------------------------------------
function clearInputs(inputs) {
    inputs.forEach(id => document.getElementById(id).value = "");
}

// Hàm support không lỗi ở UNIKEY ---------------------------------------------------------------------------------------------------------------------------------------------------------------
function supportUNIKEY(input) {
    let timeout_nhap_duLieu;
    clearTimeout(timeout_nhap_duLieu);
    timeout_nhap_duLieu = setTimeout(() => {
        input.value = input.value.normalize('NFC').replace(/[^a-zA-ZÀ-ỹ\s\u0300-\u036f]/g, '');
    }, 100); // delay để Unikey xử lý dấu
}

// Hàm nút đăng xuất ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".logout").addEventListener("click", function () {
        Swal.fire({
            title: "Bạn có chắc muốn đăng xuất?",
            text: "Bạn sẽ được chuyển đến trang đăng nhập.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: '<span style="display: inline-block; width: 100px;">Đăng xuất</span>',
            cancelButtonText: '<span style="display: inline-block; width: 100px;">Hủy</span>'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Đăng xuất thành công",
                    text: "Bạn sẽ được chuyển hướng",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    localStorage.removeItem('username');
                    localStorage.removeItem('rememberMe');
                    sessionStorage.clear();
                    window.location.assign('index.html');
                });
            }
        });
    });
});

// Hàm support giao diện -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function updateDate() {
    const dateElement = document.getElementById('dateDisplay');
    const now = new Date();
    const formattedDate = now.getDate().toString().padStart(2, '0') + '/' +
        (now.getMonth() + 1).toString().padStart(2, '0') + '/' +
        now.getFullYear();
    dateElement.textContent = formattedDate;
}

// Hàm để thêm spinner và chữ "Đang load dữ liệu" vào trang
function showLoading() {
    // Tạo phần tử spinner
    const spinner = document.createElement("div");
    spinner.id = "loadingSpinner";
    spinner.classList.add("loading-spinner");

    // Tạo phần tử chữ "Đang load dữ liệu"
    const loadingText = document.createElement("div");
    loadingText.id = "loadingText";
    loadingText.classList.add("loading-text");
    loadingText.textContent = "Đang load dữ liệu...";

    // Thêm phần tử spinner và chữ vào body
    document.body.appendChild(spinner);
    document.body.appendChild(loadingText);

    // Thêm lớp loading vào body để khóa các thao tác
    document.body.classList.add("loading");
}

// Hàm để xóa spinner và chữ "Đang load dữ liệu"
function hideLoading() {
    // Xóa phần tử spinner và chữ "Đang load dữ liệu" khỏi DOM
    const spinner = document.getElementById("loadingSpinner");
    const loadingText = document.getElementById("loadingText");

    if (spinner) {
        spinner.remove();
    }
    if (loadingText) {
        loadingText.remove();
    }

    // Xóa lớp loading khỏi body để cho phép thao tác
    document.body.classList.remove("loading");
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');

    // Nếu đang mở và chuẩn bị thu gọn
    if (sidebar.classList.contains('expanded')) {
        const openSubmenus = sidebar.querySelectorAll('.submenu.open');

        openSubmenus.forEach(submenu => {
            submenu.classList.add('closing');
            submenu.classList.remove('open');
        });

        // Chờ animation xong rồi mới thu gọn sidebar
        setTimeout(() => {
            sidebar.classList.remove('expanded');
            openSubmenus.forEach(submenu => submenu.classList.remove('closing'));
        }, 300); // ⏱ khớp với animation: slideUp 0.4s
    } else {
        // Nếu đang thu gọn → mở sidebar ngay
        sidebar.classList.add('expanded');
    }
}

function toggleSubMenu(headerElement) {
    const sidebar = document.getElementById('sidebar');
    const group = headerElement.parentElement;
    const submenu = group.querySelector('.submenu');

    if (!sidebar.classList.contains('expanded')) {
        sidebar.classList.add('expanded');
        setTimeout(() => submenu.classList.add('open'), 300);
        return;
    }

    if (submenu.classList.contains('open')) {
        submenu.classList.add('closing');
        submenu.classList.remove('open');
        setTimeout(() => {
            submenu.classList.remove('closing');
        }, 300);
    } else {
        submenu.classList.add('open');
    }
}

function goHome() {
    window.location.href = 'home.html';
}

// Hiển thị modal lưu đồ khi mở file
// Swal.fire({
//     title: "Lưu đồ hệ thống",
//     html: '<div class="mermaid">graph LR\nA[Start] --> B{Kiểm tra dữ liệu}\nB -- Có dữ liệu khác BT --> C[Người có bệnh]\nB -- Tất cả BT --> D[Người không bệnh]\nC & D --> E[Hiển thị kết quả]</div>',
//     width: 600,
//     didOpen: () => {
//         // Khởi tạo Mermaid cho nội dung modal
//         mermaid.initialize({ startOnLoad: true });
//         mermaid.init(undefined, Swal.getPopup().querySelector('.mermaid'));
//     }
// });
