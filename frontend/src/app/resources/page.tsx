'use client';

import Link from 'next/link';
import styles from './Resources.module.css';

interface ResourceCategory {
  title: string;
  description: string;
  items: ResourceItem[];
}

interface ResourceItem {
  title: string;
  description: string;
  links: { text: string; url: string }[];
}

const ResourcesPage = () => {
  const resourceCategories: ResourceCategory[] = [
    {
      title: "Государственные органы",
      description: "Официальные каналы для подачи жалоб и обращений",
      items: [
        {
          title: "МВД России — Киберполиция",
          description: "Сообщить о кибермошенничестве, фишинге, скаме, вымогательстве.",
          links: [
            { text: "https://мвд.рф/", url: "https://мвд.рф/" },
            { text: "Приём обращений: https://мвд.рф/request_main", url: "https://мвд.рф/request_main" }
          ]
        },
        {
          title: "Генеральная прокуратура РФ — жалобы",
          description: "Подача обращений по незаконным действиям, в т.ч. мошенникам.",
          links: [
            { text: "https://epp.genproc.gov.ru/web/gprf/internet-reception", url: "https://epp.genproc.gov.ru/web/gprf/internet-reception" }
          ]
        },
        {
          title: "Роспотребнадзор — жалобы на потребительское мошенничество",
          description: "Обман в магазинах, интернет-покупки, фальшивые сервисы.",
          links: [
            { text: "https://rospotrebnadzor.ru/", url: "https://rospotrebnadzor.ru/" },
            { text: "Приём обращений: https://rospotrebnadzor.ru/feedback", url: "https://rospotrebnadzor.ru/feedback" }
          ]
        },
        {
          title: "Роскомнадзор — жалобы на фишинговые сайты, спам, незаконные обработки данных",
          description: "Можно пожаловаться на сайт или незаконную рассылку.",
          links: [
            { text: "https://rkn.gov.ru/treatments/", url: "https://rkn.gov.ru/treatments/" }
          ]
        },
        {
          title: "Центробанк РФ — жалобы на финансовое мошенничество",
          description: "Фальшивые брокеры, кредитные мошенники, навязывание услуг.",
          links: [
            { text: "https://fincult.info/", url: "https://fincult.info/" },
            { text: "Приём жалоб: https://www.cbr.ru/Reception/", url: "https://www.cbr.ru/Reception/" }
          ]
        },
        {
          title: "Госуслуги — жалоба или заявление о мошенничестве",
          description: "Можно оформить обращение в полицию или госорган онлайн.",
          links: [
            { text: "https://www.gosuslugi.ru/help/faq/citizens/757", url: "https://www.gosuslugi.ru/help/faq/citizens/757" }
          ]
        }
      ]
    },
    {
      title: "Проверка финансовых организаций",
      description: "Ресурсы для проверки легальности финансовых компаний",
      items: [
        {
          title: "База ЦБ РФ «Чёрный список компаний»",
          description: "Проверка брокеров, страховщиков, инвестплатформ, МФО.",
          links: [
            { text: "https://www.cbr.ru/finorg/", url: "https://www.cbr.ru/finorg/" },
            { text: "Список мошенников: https://www.cbr.ru/finmarket/affairs/blacklist/", url: "https://www.cbr.ru/finmarket/affairs/blacklist/" }
          ]
        },
        {
          title: "Реестр разрешённых МФО, банков и страховых",
          description: "Чтобы проверить, легален ли «банк» или «финансовая компания».",
          links: [
            { text: "https://www.cbr.ru/finorg/", url: "https://www.cbr.ru/finorg/" }
          ]
        }
      ]
    },
    {
      title: "Проверка сайтов, компаний и ИП",
      description: "Сервисы для проверки контрагентов и компаний",
      items: [
        {
          title: "ФНС — проверка ИП и компаний",
          description: "Узнать, зарегистрирован ли продавец или сервис.",
          links: [
            { text: "https://egrul.nalog.ru/", url: "https://egrul.nalog.ru/" }
          ]
        },
        {
          title: "«Контур.Фокус» — проверка организации (имеет бесплатную версию)",
          description: "Судебные дела, банкротства, история компании.",
          links: [
            { text: "https://focus.kontur.ru/", url: "https://focus.kontur.ru/" }
          ]
        },
        {
          title: "Единый реестр недобросовестных поставщиков",
          description: "Проверяет, не поймана ли компания на мошенничестве при тендерах.",
          links: [
            { text: "https://zakupki.gov.ru/epz/dishonestsupplier/quicksearch/search.html", url: "https://zakupki.gov.ru/epz/dishonestsupplier/quicksearch/search.html" }
          ]
        }
      ]
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Полезные сервисы и ресурсы</h1>
        <p className={styles.subtitle}>
          Официальные ресурсы для защиты от мошенничества и проверки контрагентов
        </p>
      </div>

      <div className={styles.categories}>
        {resourceCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className={styles.category}>
            <div className={styles.categoryHeader}>
              <h2 className={styles.categoryTitle}>{category.title}</h2>
              <p className={styles.categoryDescription}>{category.description}</p>
            </div>
            
            <div className={styles.resourcesList}>
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className={styles.resourceItem}>
                  <h3 className={styles.resourceTitle}>{item.title}</h3>
                  <p className={styles.resourceDescription}>{item.description}</p>
                  <div className={styles.links}>
                    {item.links.map((link, linkIndex) => (
                      <a 
                        key={linkIndex} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        <span className={styles.linkIcon}>📎</span>
                        {link.text}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcesPage;