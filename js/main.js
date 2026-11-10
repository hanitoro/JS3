// ---------- Слайдер (Swiper) ----------
new Swiper('.swiper', {
    loop: true,
    navigation: {
        nextEl: '.slider-next',
        prevEl: '.slider-prev',
    },
});

// ---------- Ссылки на элементы ----------
const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('.modal-cart');
const longGoodsList = document.querySelector('.long-goods-list');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const navigationLinks = document.querySelectorAll('.navigation-link');
const logo = document.querySelector('.logo');

// Все товары из «базы данных». Загружаются асинхронно (для fetch нужен локальный сервер)
let goods = [];

const getGoods = () =>
    fetch('db/db.json')
        .then((response) => response.json())
        .then((result) => {
            goods = result;
            renderCards(goods);
        });

// ---------- Корзина ----------
const cart = {
    cartGoods: [],

    findGood(id) {
        return this.cartGoods.find((good) => good.id === id);
    },

    renderCart() {
        cartTableGoods.textContent = '';

        this.cartGoods.forEach(({ id, name, price, count }) => {
            const trGood = document.createElement('tr');
            trGood.classList.add('cart-item');
            trGood.dataset.id = id;

            trGood.innerHTML = `
                <td>${name}</td>
                <td>$${price}</td>
                <td><button class="btn btn-sm btn-outline-secondary cart-btn-minus" data-id="${id}">-</button></td>
                <td>${count}</td>
                <td><button class="btn btn-sm btn-outline-secondary cart-btn-plus" data-id="${id}">+</button></td>
                <td>$${price * count}</td>
                <td><button class="btn btn-sm btn-outline-danger cart-btn-delete" data-id="${id}">x</button></td>
            `;

            cartTableGoods.append(trGood);
        });

        const totalPrice = this.cartGoods.reduce(
            (sum, item) => sum + item.price * item.count,
            0
        );

        cardTableTotal.textContent = `$${totalPrice}`;
    },

    deleteGood(id) {
        this.cartGoods = this.cartGoods.filter((item) => item.id !== id);
        this.renderCart();
    },

    minusGood(id) {
        const item = this.findGood(id);
        if (!item) return;

        if (item.count <= 1) {
            this.deleteGood(id);
        } else {
            item.count--;
            this.renderCart();
        }
    },

    plusGood(id) {
        const item = this.findGood(id);
        if (!item) return;

        item.count++;
        this.renderCart();
    },

    addGood(id) {
        if (this.findGood(id)) {
            this.plusGood(id);
            return;
        }

        const goodItem = goods.find((item) => item.id === id);
        if (!goodItem) return;

        const { id: itemId, name, price } = goodItem;
        this.cartGoods.push({ id: itemId, name, price, count: 1 });
        this.renderCart();
    },
};

// ---------- Модальное окно ----------
buttonCart.addEventListener('click', () => {
    cart.renderCart();
    modalCart.classList.add('show');
});

// mouseup, а не click: чтобы окно не закрылось, если мышь отпустили вне его
document.addEventListener('mouseup', (event) => {
    const target = event.target;

    if (!modalCart.classList.contains('show')) return;

    if (target.classList.contains('modal-close') || !target.closest('.modal-window')) {
        modalCart.classList.remove('show');
    }
});

// ---------- Делегирование: кнопки внутри таблицы корзины ----------
cartTableGoods.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName !== 'BUTTON') return;

    const id = target.dataset.id;

    if (target.classList.contains('cart-btn-delete')) {
        cart.deleteGood(id);
    } else if (target.classList.contains('cart-btn-minus')) {
        cart.minusGood(id);
    } else if (target.classList.contains('cart-btn-plus')) {
        cart.plusGood(id);
    }
});

// ---------- Делегирование: «В корзину» в каталоге ----------
document.body.addEventListener('click', (event) => {
    const addToCart = event.target.closest('.button-add-cart');

    if (addToCart) {
        cart.addGood(addToCart.dataset.id);
    }
});

// ---------- Плавный скролл по якорным ссылкам ----------
const scrollLinks = document.querySelectorAll('a.scroll-link');

for (const scrollLink of scrollLinks) {
    scrollLink.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ---------- Каталог ----------
const createCard = (card) => {
    const { id, name, price, label, img, description } = card;

    const div = document.createElement('div');
    div.classList.add('col-12', 'col-sm-6', 'col-lg-3', 'mb-4');

    div.innerHTML = `
        <div class="goods-card">
            ${label ? `<span class="goods-card__label">${label}</span>` : ''}
            <img src="${img}" alt="${name}" />
            <h5>${name}</h5>
            <p class="text-muted mb-1">${description}</p>
            <button class="btn btn-dark button-add-cart" data-id="${id}">
                <span>$${price}</span> В корзину
            </button>
        </div>
    `;

    return div;
};

const renderCards = (data) => {
    longGoodsList.textContent = '';
    longGoodsList.append(...data.map(createCard));
};

const filterCards = (field, value) => {
    renderCards(goods.filter((good) => good[field] === value));
};

// ---------- Категории в шапке ----------
navigationLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();

        const field = link.dataset.field;
        const value = link.textContent;

        if (field === 'all') {
            renderCards(goods);
            return;
        }

        filterCards(field, value);
    });
});

// клик по логотипу — вернуть весь каталог
logo.addEventListener('click', (event) => {
    event.preventDefault();
    renderCards(goods);
});

getGoods();
