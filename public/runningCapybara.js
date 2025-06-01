document.addEventListener('DOMContentLoaded', () => {
    const capybaraContainer = document.getElementById('running-capybara-container');
    let capybaras = [];
    let positions = [];
    const numCapybaras = 10;  // Số lượng capybara
    const spacing = 200;  // Khoảng cách tối thiểu giữa các capybara

    // Tạo nhiều capybara
    for (let i = 0; i < numCapybaras; i++) {
        const capybara = document.createElement('div');
        capybara.classList.add('capybara');
        capybara.style.bottom = '0px';  // Đặt tất cả capybara ở dưới cùng màn hình
        capybara.style.left = `${window.innerWidth + i * spacing}px`;  // Khởi tạo vị trí với khoảng cách an toàn
        capybaraContainer.appendChild(capybara);
        capybaras.push(capybara);
        positions.push({ x: window.innerWidth + i * spacing });
    }

    let animationId;

    function moveCapybaras() {
        for (let i = 0; i < numCapybaras; i++) {
            // Di chuyển từ phải sang trái
            positions[i].x -= 2;  // Tốc độ di chuyển

            // Khi capybara ra khỏi màn hình bên trái, xuất hiện lại từ bên phải với khoảng cách an toàn
            if (positions[i].x < -150) {
                const previousIndex = (i === 0) ? numCapybaras - 1 : i - 1;
                positions[i].x = positions[previousIndex].x + spacing;  // Xuất hiện lại từ bên phải với khoảng cách so với con trước đó
            }

            capybaras[i].style.left = `${positions[i].x}px`;
        }

        animationId = requestAnimationFrame(moveCapybaras);
    }

    function startAnimation() {
        if (!animationId) {
            moveCapybaras();
        }
    }

    function stopAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    // Thêm logic để hiển thị/ẩn capybara dựa trên theme
    const themeSelect = document.getElementById('theme-select');
    themeSelect.addEventListener('change', (e) => {
        document.body.className = e.target.value ? `theme-${e.target.value}` : '';
        if (e.target.value === 'capybara') {
            capybaraContainer.style.display = 'block';
            startAnimation();
        } else {
            capybaraContainer.style.display = 'none';
            stopAnimation();
        }
    });

    // Khởi tạo animation nếu theme capybara đã được chọn
    if (themeSelect.value === 'capybara') {
        capybaraContainer.style.display = 'block';
        startAnimation();
    }
});
