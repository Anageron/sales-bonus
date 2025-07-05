/**
 * Функция для расчета прибыли
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // @TODO: Расчет прибыли от операции
  const discount = 1 - purchase.discount / 100;
  return purchase.sale_price * purchase.quantity * discount;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге
  if (index == 0) {
    return seller.profit*0.15;
} else if (index == 2|| 3) {
    return seller.profit*0.1;
} else if (total-1) {
    return 0;
} else { // Для всех остальных
    return seller.profit*0.05;
} 
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных

  if (!data || !Array.isArray(data.sellers) || data.sellers.length === 0) {
    throw new Error("Некорректные входные данные");
  }

  const { calculateRevenue, calculateBonus } = options;
  // @TODO: Проверка наличия опций
  if (
    typeof calculateRevenue !== "function" ||
    typeof calculateBonus !== "function"
  ) {
    throw new Error("Чего-то не хватает");
  }

  // @TODO: Подготовка промежуточных данных для сбора статистики

  const sellerStats = data.sellers.map((seller) => ({
    id: seller.id,
    name: `${seller.first_name} ${seller.last_name}`,
  }));

  // @TODO: Индексация продавцов и товаров для быстрого доступа

  const sellerIndex = sellerStats.reduce(
    (result, seller) => ({
      ...result,
      [seller.id]: seller,
    }),
    {}
  );
  

  const productIndex = data.products.reduce(
    (result, product) => ({
      ...result,
      [product.sku]: product,
    }),
    {}
  );
  

  // @TODO: Расчет выручки и прибыли для каждого продавца

  data.purchase_records.forEach((record) => {
    // Чек

    const seller = sellerIndex[record.seller_id]; // Продавец

    // Увеличить количество продаж

    seller.sales_count = (seller.sales_count || 0) + 1;

    // Увеличить общую сумму всех продаж

    let total_amount = 0;

    // Расчёт прибыли для каждого товара

    record.items.forEach((item) => {
      const product = productIndex[item.sku]; // Товар

      // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека

      const cost = product.purchase_price * item.quantity;

      // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue

      const revenue = calculateRevenue(item);

      total_amount += revenue;

      // Посчитать прибыль: выручка минус себестоимость

      const profit = revenue - cost;

      // Увеличить общую накопленную прибыль (profit) у продавца

      seller.profit = (seller.profit || 0) + profit;

      // Учёт количества проданных товаров
      if (!seller.products_sold) {
        seller.products_sold = {};
      }
      // По артикулу товара увеличить его проданное количество у продавца
      seller.products_sold[item.sku] =
        (seller.products_sold[item.sku] || 0) + item.quantity;
    });

    seller.revenue = (seller.revenue || 0) + total_amount;

   
   
  });

  // @TODO: Сортировка продавцов по прибыли

 sellerStats.sort(function (a, b) {
      return b.profit - a.profit;
    });

   

  // @TODO: Назначение премий на основе ранжирования

    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonus(index,Object.keys(sellerStats).length ,seller);// Считаем бонус
        seller.top_products = Object.entries(seller.products_sold)
          .map(([sku, quantity]) => ({ sku, quantity }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0,10);
}); 

return sellerStats.map(seller => ({
        seller_id: seller.id,// Строка, идентификатор продавца
        name: seller.name ,// Строка, имя продавца
        revenue:+seller.revenue.toFixed(2) ,// Число с двумя знаками после точки, выручка продавца
        profit:+seller.profit.toFixed(2) ,// Число с двумя знаками после точки, прибыль продавца
        sales_count:seller.sales_count ,// Целое число, количество продаж продавца
        top_products:seller.top_products ,// Целое число, топ-10 товаров продавца
        bonus:+seller.bonus.toFixed(2) // Число с двумя знаками после точки, бонус продавца
})); 
 
  // @TODO: Подготовка итоговой коллекции с нужными полями
}
