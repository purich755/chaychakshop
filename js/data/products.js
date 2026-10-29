/* Каталог «Дома татарской продукции».
   Один товар — одна запись. Как перенести данные из Excel — в README.md.

   id         латиница через дефис, совпадает с именем фото: img/products/<id>-1.webp
   category   tea | sweets | honey | drinks | chests | souvenirs
   name       название как на полке
   short      одна строка для карточки
   description  2–3 предложения для окна товара — только то, что видно на упаковке
   weight     «75 г», «250 мл» или null
   price      число в рублях или null → «цену подскажем в магазине»
   priceFrom  true → «от 390 ₽»
   priceNote  дополнительная строка под ценой
   variants   [{ label: '200 г', price: 200 }] — переключатель фасовки в карточке
   images     пути к фото 800 px; крупные (1400 px) лежат в img/products/large/, превью (360 px) — в img/products/thumb/
   video      необязательный ролик для окна товара
   featured   true → крупная карточка в «Все»
   for        кому подходит (для подборщика): mom | colleague | friend | kid | self
   budget     low (до 500 ₽) | mid (500–1 500 ₽) | high (сундуки и наборы)
   gift       одна строка «почему подходит» — показывается в подборщике
*/
window.CATEGORIES = [
  { id: 'all', name: 'Все', tone: 'paper' },
  { id: 'tea', name: 'Чай', tone: 'sky' },
  { id: 'sweets', name: 'Чак-чак и сладости', tone: 'rose' },
  { id: 'honey', name: 'Мёд и урбеч', tone: 'lime' },
  { id: 'drinks', name: 'Напитки', tone: 'mint' },
  { id: 'chests', name: 'Сундуки и наборы', tone: 'lilac' },
  { id: 'souvenirs', name: 'Сувениры', tone: 'sky' },
];

(function () {
  var p = function (id, n) {
    var out = [];
    for (var i = 1; i <= n; i++) out.push('img/products/' + id + '-' + i + '.webp');
    return out;
  };

  window.PRODUCTS = [
    // ——— Чай ———
    { id: 'chay-bogatyh-tatar', category: 'tea', name: 'Чай Богатых Татар', short: 'Травяной купаж в чёрной пачке с золотом',
      description: 'Травяной купаж в подарочной чёрной пачке с золотыми буквами. Через окошко видно сам чай — пачку не нужно упаковывать, она уже нарядная.',
      weight: '75 г', price: 400, images: p('chay-bogatyh-tatar', 2), video: 'video/chay-bogatyh-tatar.mp4',
      featured: true, for: ['mom', 'colleague', 'self'], budget: 'low', gift: 'Нарядная пачка — подарок без обёртки' },
    { id: 'kazanskiy-chay', category: 'tea', name: 'Казанский прессованный чай', short: 'Зелёный, чёрный или фруктовый — плиткой',
      description: 'Чай, спрессованный плиткой, в коробке с окошком и татарским узором. Три вкуса: зелёный, чёрный и фруктовый.',
      weight: '150 г', price: 650, images: p('kazanskiy-chay', 3),
      for: ['mom', 'colleague'], budget: 'mid', gift: 'Чай плиткой — такого дома ещё нет' },
    { id: 'blue-tea', category: 'tea', name: 'Blue tea — синий чай', short: 'Без красителей, две фасовки',
      description: 'Синий чай без красителей в фиолетовой пачке. Две фасовки — 30 и 50 граммов.',
      weight: '30 г / 50 г', price: 450, variants: [{ label: '30 г', price: 450 }, { label: '50 г', price: 650 }], images: p('blue-tea', 2),
      for: ['friend', 'colleague', 'self'], budget: 'low', gift: 'Синий чай — разговор за столом обеспечен' },
    { id: 'tatar-mohito', category: 'tea', name: '«Татар мохито»', short: 'Травяной чай с цитрусом',
      description: 'Травяной сбор с цитрусом в крафтовом пакете. В окошке видно травы и сушёные дольки.',
      weight: null, price: null, images: p('tatar-mohito', 3),
      for: ['friend', 'self'], budget: 'low', gift: 'Летний чай с цитрусом' },
    { id: 'sbiten', category: 'tea', name: 'Сбитень', short: '«Тәмле», «Хаир», «Татарстан», «Байрам»',
      description: 'Четыре сбитня в высоких коробках с узором: «Тәмле», «Хаир», «Татарстан» и «Байрам». На каждой написано: мёд, травы, пряности.',
      weight: null, price: null, images: p('sbiten', 1),
      for: ['mom', 'colleague'], budget: 'low', gift: 'Мёд, травы и пряности в одной коробке' },

    // ——— Чак-чак и сладости ———
    { id: 'chak-chak', category: 'sweets', name: 'Чак-чак на натуральном мёду', short: 'Без красителей и консервантов',
      description: 'Тот самый чак-чак, за которым к нам приезжают из других городов. На натуральном мёду, без красителей и консервантов. Три размера коробки.',
      weight: '200 / 300 / 400 г', price: 200, variants: [{ label: '200 г', price: 200 }, { label: '300 г', price: 300 }, { label: '400 г', price: 400 }],
      images: p('chak-chak', 6), featured: true, for: ['mom', 'colleague', 'friend', 'kid', 'self'], budget: 'low', gift: 'Главный казанский гостинец — свежий, на мёду' },
    { id: 'chak-chak-baton', category: 'sweets', name: 'Чак-чак батончик', short: 'Чак-чак на один перекус',
      description: 'Порция чак-чака в яркой обёртке — удобно взять в дорогу или раздать в офисе.',
      weight: '45 г', price: 50, images: p('chak-chak-baton', 1),
      for: ['kid', 'colleague', 'self'], budget: 'low', gift: 'Хватит на весь офис' },
    { id: 'chak-chak-shokolad', category: 'sweets', name: 'Чак-чак в шоколаде', short: 'В белой и тёмной глазури',
      description: 'Порционный чак-чак в шоколадной глазури — белой и тёмной — в прозрачной коробке.',
      weight: null, price: null, images: p('chak-chak-shokolad', 1),
      for: ['kid', 'friend'], budget: 'low', gift: 'Чак-чак для сладкоежек' },
    { id: 'smakers', category: 'sweets', name: '«Смакерс»', short: 'Чак-чак с карамелью и арахисом',
      description: 'Чак-чак, карамель и арахис в одной пачке.',
      weight: '250 г', price: 300, images: p('smakers', 1),
      for: ['kid', 'friend'], budget: 'low', gift: 'Чак-чак, который выбирают дети' },
    { id: 'baursak', category: 'sweets', name: 'Баурсак', short: 'В круглой коробке',
      description: 'Баурсак в круглой прозрачной коробке, на крышке — Казанский кремль и надпись «Сила традиций».',
      weight: null, price: null, images: p('baursak', 3),
      for: ['kid', 'mom'], budget: 'low', gift: 'К чаю на всю семью' },
    { id: 'shokolad-kuchtenech', category: 'sweets', name: 'Шоколад «Кучтәнәч» с клубникой', short: '«Кучтәнәч» — и есть гостинец',
      description: 'Шоколад с клубникой в белой обёртке с татарским узором. «Кучтәнәч» по-татарски — гостинец, так его и дарите.',
      weight: '100 г', price: 650, images: p('shokolad-kuchtenech', 1),
      for: ['mom', 'colleague', 'friend'], budget: 'mid', gift: 'Название уже всё сказало: гостинец' },
    { id: 'shokolad-yaratam', category: 'sweets', name: 'Шоколад «Яратам»', short: '«Яратам» — по-татарски «люблю»',
      description: 'Казанский шоколад в обёртке с девушкой в калфаке. Открытка, которую можно съесть.',
      weight: null, price: null, images: p('shokolad-yaratam', 1),
      for: ['friend', 'mom'], budget: 'low', gift: '«Люблю» по-татарски' },
    { id: 'dubai-shokolad', category: 'sweets', name: 'Дубайский шоколад', short: 'Тот самый — только сделан в Казани',
      description: 'Плитка с зелёной начинкой, как у дубайского, только сделана в Казани — на коробке так и написано: Made in Kazan.',
      weight: null, price: null, images: p('dubai-shokolad', 3),
      for: ['friend', 'self'], budget: 'mid', gift: 'Модный шоколад казанского производства' },
    { id: 'echpochmak-desert', category: 'sweets', name: 'Шоколадный десерт «Өчпочмак»', short: 'Треугольник, как настоящий эчпочмак',
      description: 'Шоколадный десерт в форме эчпочмака, в коробке-треугольнике с лентой.',
      weight: null, price: null, images: p('echpochmak-desert', 1),
      for: ['kid', 'friend'], budget: 'low', gift: 'Эчпочмак, но шоколадный' },
    { id: 'findi', category: 'sweets', name: 'Конфеты «Финди»', short: '«Рәхим итегез» и «С любовью из Казани»',
      description: 'Конфеты в пакетах с казанскими видами. Две серии: «Рәхим итегез» и «С любовью из Казани».',
      weight: '150 г', price: 350, images: p('findi', 2),
      for: ['colleague', 'mom'], budget: 'low', gift: 'Пакет с Казанью — уже открытка' },
    { id: 'pryaniki', category: 'sweets', name: 'Расписные пряники', short: '«Из Татарстана с любовью»',
      description: 'Пряники с рисунком глазурью: Кремль, мальчик и девочка в национальных костюмах. Каждый — в своём пакете с лентой.',
      weight: null, price: null, images: p('pryaniki', 3),
      for: ['kid', 'mom'], budget: 'low', gift: 'Жалко есть — красиво' },

    // ——— Мёд и урбеч ———
    { id: 'myod', category: 'honey', name: 'Натуральный деревенский мёд', short: 'С собственной пасеки',
      description: 'Мёд с собственной пасеки в стеклянной банке с синей лентой. Две банки: 180 и 250 мл.',
      weight: '180 / 250 мл', price: 300, variants: [{ label: '180 мл', price: 300 }, { label: '250 мл', price: 400 }], images: p('myod', 3),
      featured: true, for: ['mom', 'colleague', 'self'], budget: 'low', gift: 'Мёд с пасеки — к чаю всей семьёй' },
    { id: 'urbech', category: 'honey', name: 'Урбеч', short: 'Перетёрт на каменных жерновах',
      description: 'Паста из орехов и семян, перетёртая на каменных жерновах. Ассорти, фундук, арахис и натуральный.',
      weight: '250 мл', price: 390, priceFrom: true, images: p('urbech', 3),
      for: ['mom', 'self'], budget: 'low', gift: 'Ореховая паста к утренней каше' },

    // ——— Напитки ———
    { id: 'kvas', category: 'drinks', name: 'Казанский домашний квас', short: 'Холодный — из холодильника в зале',
      description: 'Домашний квас в бутылках — берите холодным из холодильника в зале.',
      weight: null, price: 270, images: p('kvas', 1), featured: true,
      for: ['friend', 'self'], budget: 'low', gift: 'Казань на вкус — прямо в дороге' },

    // ——— Сундуки и наборы ———
    { id: 'sunduki-pod-zakaz', category: 'chests', name: 'Татарские сундуки под заказ', short: 'Шесть размеров, ручная работа',
      description: 'Сундуки ручной работы под заказ (цены без внутренней обшивки). SUPER VIP 100×50×40 см — 19 000 ₽, большой метровый сундук приданого, только под заказ, от 7 до 14 дней. Premium 75×40×38 см — 16 000 ₽. VIP 36×27×20 см — 9 000 ₽. Ханский 30×20×17 см — 5 000 ₽. Сөембикә 25×14×12 см — 4 000 ₽. Сувенирный 20×10×8 см — 3 000 ₽. В VIP, Ханский и Сөембикә помещаются гостинцы, в сувенирный — уже нет.',
      weight: null, price: 3000, priceFrom: true, priceNote: 'до 19 000 ₽ — зависит от размера', images: p('birne-sandygy', 2), featured: true,
      for: ['mom', 'friend', 'colleague'], budget: 'high', gift: 'Сундук ручной работы — на никах или юбилей' },
    { id: 'sunduk-syuyumbike', category: 'chests', name: 'Сундук «Сөембикә»', short: '25 × 14 × 12 см, ручная работа',
      description: 'Сундук ручной работы 25 × 14 × 12 см. Внутрь помещаются гостинцы — можно собрать подарок. Цена без внутренней обшивки.',
      weight: '25 × 14 × 12 см', price: 4000, images: p('sunduk-syuyumbike', 1),
      for: ['mom', 'colleague'], budget: 'high', gift: 'Небольшой сундук, в который поместятся гостинцы' },
    { id: 'sunduk-napolnenie', category: 'chests', name: 'Татарский сундук с наполнением', short: 'Сундук, а внутри — гостинцы',
      description: 'Белый сундук с золотой чеканкой, а внутри — чай, мёд, сладости и сувенир.',
      weight: '6 кг', price: 6500, images: p('sunduk-napolnenie', 1),
      for: ['colleague', 'friend', 'kid', 'self'], budget: 'high', gift: 'Сразу и сундук, и всё к чаю' },
    { id: 'nabor-milli', category: 'chests', name: 'Подарочный набор «Милли»', short: 'Наполнение — на ваш выбор',
      description: 'Голубой короб, который собираем вместе с вами: чай, сладости, мёд — что захотите.',
      weight: null, price: 1600, priceNote: 'с наполнением 2 100–3 100 ₽', images: p('nabor-milli', 1),
      for: ['colleague', 'kid', 'self'], budget: 'high', gift: 'Соберём вместе с вами' },

    // ——— Сувениры ———
    { id: 'kotik', category: 'souvenirs', name: 'Котик из Казани', short: 'Мягкая игрушка с нашивкой',
      description: 'Серый плюшевый кот с круглой нашивкой «Котик из Казани».',
      weight: null, price: 800, images: p('kotik', 2), featured: true,
      for: ['kid'], budget: 'mid', gift: 'Мягкий друг «из Казани»' },
    { id: 'kotik-brelok', category: 'souvenirs', name: 'Котик-брелок с эчпочмаком', short: 'Держит треугольник — как положено',
      description: 'Брелок-котик, который обнимает эчпочмак. Есть чёрный, бежевый и рыжий.',
      weight: null, price: 500, images: p('kotik-brelok', 3),
      for: ['kid', 'friend', 'colleague'], budget: 'low', gift: 'На ключи или рюкзак' },
    { id: 'magnit', category: 'souvenirs', name: 'Вышитый магнит', short: 'Ручная работа',
      description: 'Магнит с вышивкой — тюльпаном или татарским узором. Вышит вручную.',
      weight: null, price: 100, images: p('magnit', 3),
      for: ['colleague', 'friend', 'mom'], budget: 'low', gift: 'Маленький, но вышит вручную' },
    { id: 'tarelka', category: 'souvenirs', name: 'Историческая тарелка Казани', short: 'Кремль, Кул Шариф, старые улицы',
      description: 'Сувенирная тарелка с видами Казани — цветная или в сепии.',
      weight: null, price: 800, images: p('tarelka', 3),
      for: ['mom', 'colleague'], budget: 'mid', gift: 'Казань на стене кухни' },
    { id: 'shoper', category: 'souvenirs', name: 'Шопер с афоризмами', short: '«Татары на 80% состоят из чая»',
      description: 'Холщовая сумка с надписями: «Татары на 80% состоят из чая», «Татары могут не поесть, а чай попьют обязательно!» и другими.',
      weight: null, price: 700, images: p('shoper', 4),
      for: ['friend', 'self'], budget: 'mid', gift: 'Смешно — и каждый день с собой' },
    { id: 'bannaya-shapka', category: 'souvenirs', name: 'Банная шапка «Җиңел пар белән!»', short: '«С лёгким паром!» по-татарски',
      description: 'Войлочная шапка для бани с вышитым тюльпаном и надписью «Җиңел пар белән!» — «С лёгким паром!».',
      weight: null, price: null, images: p('bannaya-shapka', 1),
      for: ['friend', 'self'], budget: 'low', gift: 'Для тех, кто любит баню' },
  ];
})();
