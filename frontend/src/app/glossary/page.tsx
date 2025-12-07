"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search, ArrowUp } from 'lucide-react';
import Link from 'next/link';
import './glossary.css';

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GlossarySection {
  letter: string;
  terms: GlossaryTerm[];
}

// Static glossary data
const glossaryData: GlossarySection[] = [
  {
    letter: 'А',
    terms: [
      {
        term: 'Аферизм (афера)',
        definition: 'Преднамеренный обман с целью получения выгоды (денег, имущества или информации). В отличие от скама, может быть как онлайн, так и оффлайн.\nПример: звонок с предложением «вы выиграли приз», но просят оплатить «налог» заранее.'
      },
      {
        term: 'Атака «человек посередине» (Man-in-the-middle)',
        definition: 'Перехват данных между пользователем и сайтом.\nТак часто воруют пароли в общедоступном Wi-Fi.'
      }
    ]
  },
  {
    letter: 'Б',
    terms: [
      {
        term: 'Банковский скимминг',
        definition: 'Метод кражи данных банковских карт с помощью скрытых устройств на банкоматах или POS-терминалах. Скиммер считывает данные карты, а мошенники получают PIN-код.\nСовет: проверяйте банкомат на наличие посторонних деталей, прикрывайте клавиатуру при вводе PIN.'
      },
      {
        term: 'Бейтинг (мошенничество-приманка) (Baiting)',
        definition: 'Жертву заманивают подарком или выгодой:\n\n«бесплатный подарок»,\n\n«бесплатный доступ к Wi-Fi»,\n\n«кликни, чтобы получить бонус».\nВзамен получают доступ к устройству или данным.'
      },
      {
        term: 'Ботнет (Botnet)',
        definition: 'Сеть заражённых устройств\n\nКомпьютеры или смартфоны заражены и работают как единая сеть под контролем преступников.\nИспользуются для DDoS-атак, рассылок и воровства данных.'
      },
      {
        term: 'Брутфорс (перебор пароля) (Brute force)',
        definition: 'Метод взлома, когда система перебирает пароли автоматически, пока не найдёт подходящий.\nСтрадают простые пароли: 1111, qwerty, 123456.'
      },
      {
        term: 'Бэкдор (чёрный ход) (Backdoor)',
        definition: 'Скрытая возможность доступа в систему, которую оставляют злоумышленники (или иногда сами разработчики).'
      }
    ]
  },
  {
    letter: 'В',
    terms: [
      {
        term: 'Вишинг (Vishing)',
        definition: 'Мошенничество через телефонный звонок. Мошенник выдаёт себя за сотрудника банка, полиции или другой организации, чтобы выдать личную информацию.\nПример: «Ваш счёт заблокирован, назовите код подтверждения».'
      },
      {
        term: 'Вредоносные расширения',
        definition: 'Расширения для браузера, которые тайно собирают данные, показывают рекламу или подменяют ссылки для фишинга.\nПример: расширение «бесплатный VPN», которое ворует данные платежных карт.'
      }
    ]
  },
  {
    letter: 'Г',
    terms: [
      {
        term: 'Гриндинг (социальная инженерия через игры) (Grooming)',
        definition: 'Манипуляции пользователями в онлайн-играх или игровых платформах, чтобы получить их аккаунты или виртуальные ценности.\nПример: сообщение «я дам редкий предмет, пришли пароль аккаунта».'
      }
    ]
  },
  {
    letter: 'Д',
    terms: [
      {
        term: 'Доксинг (разглашение личных данных) (Doxing)',
        definition: 'Публикация личных данных человека (адрес, телефон, паспорта) без согласия, чтобы шантажировать или дискредитировать.'
      },
      {
        term: 'Дроппинг (Drop address / Drop point)',
        definition: 'Использование чужого адреса или почтового ящика для пересылки украденных товаров или посылок. Мошенники маскируют свою личность.\nПример: покупка в интернете на чужой адрес для обмана продавца.'
      },
      {
        term: 'Драйв-бай загрузка (Drive-by download)',
        definition: 'Заражение компьютера происходит просто из-за посещения заражённого сайта — без нажатий, без скачиваний.'
      },
      {
        term: 'Двойное списание',
        definition: 'Обман покупателей или банков с целью списания средств дважды, например при онлайн-покупках.'
      }
    ]
  },
  {
    letter: 'З',
    terms: [
      {
        term: 'Zero-day уязвимость (Zero-day vulnerability)',
        definition: 'Неизвестная уязвимость в ПО, которой пользуются хакеры, пока разработчики не выпустили обновление.'
      }
    ]
  },
  {
    letter: 'К',
    terms: [
      {
        term: 'Кейлоггер (Keylogger)',
        definition: 'Программа или устройство, фиксирующее нажатия клавиш пользователя. Используется для кражи паролей, пин-кодов, секретных сообщений.'
      },
      {
        term: 'Клонирование сайта (клон-сайт)',
        definition: 'Создание поддельной версии легитимного сайта для сбора логинов, паролей, платежных данных.'
      },
      {
        term: 'Компрометация аккаунта',
        definition: 'Неавторизованный доступ к аккаунту, часто с целью кражи денег или личной информации.'
      },
      {
        term: 'Куид-про-кво (услуга за услугу) (Quid pro quo)',
        definition: 'Обещание помощи или услуги в обмен на доступ к устройству или данным.\n\nМошенник обещает услугу (например, «починим интернет») в обмен на доступ к компьютеру или паролям.'
      }
    ]
  },
  {
    letter: 'Л',
    terms: [
      {
        term: 'Ложная благотворительность',
        definition: 'Мошенничество через пожертвования на фейковые фонды или «спасение больных детей».\nПример: звонок с просьбой перевести деньги на лечение ребёнка, которого нет.'
      }
    ]
  },
  {
    letter: 'М',
    terms: [
      {
        term: 'Малварь (Malware)',
        definition: 'Вредоносное ПО: вирусы, трояны, шпионские программы, программы-вымогатели. Может красть данные, блокировать устройства или использовать их для атак.'
      },
      {
        term: 'Мошенническая пирамида',
        definition: 'Схема, где участники получают прибыль за счёт привлечения новых участников, а не от реальной продажи товаров или услуг.'
      },
      {
        term: 'Мошенничество с перезвоном (Callback fraud)',
        definition: 'Мошенники звонят на секунду и сбрасывают.\nЖертва перезванивает на платный международный номер и теряет деньги.'
      },
      {
        term: 'Мошенничество с предоплатой (Advance-fee scam)',
        definition: 'Обещают выигрыш, наследство, перевод крупной суммы, но просят заранее оплатить «налоги» или «сборы».'
      }
    ]
  },
  {
    letter: 'Н',
    terms: [
      {
        term: 'Нигилизм данных',
        definition: 'Метод кражи, когда мошенники удаляют или блокируют доступ к данным, чтобы потребовать выкуп.\nПример: ransomware (программа-вымогатель).'
      }
    ]
  },
  {
    letter: 'О',
    terms: [
      {
        term: 'Оверплатежная схема',
        definition: 'Мошенник платит «слишком много», а потом просит вернуть разницу — при этом изначальный платёж окажется фальшивым.'
      },
      {
        term: 'Отзеркаливание номера (Caller ID spoofing)',
        definition: 'Когда мошенник подменяет номер телефона так, что на экране отображается:\n\n«Сбербанк»\n\n«Полиция»\n\nили знакомый номер.'
      },
      {
        term: 'Отзеркаливание номера (спуфинг) (Spoofing)',
        definition: 'Спуфинг происходит, когда вызывающий абонент маскирует информацию, отображаемую в вашем идентификаторе вызывающего абонента. Это дает звонящему возможность замаскировать или «подделать» имя и/или номер телефона, чтобы это выглядело так, как будто он звонит как определенный человек из определенного места.'
      }
    ]
  },
  {
    letter: 'П',
    terms: [
      {
        term: 'Поддельная Wi-Fi точка (Spoofed Wi-Fi)',
        definition: 'Мошенники создают Wi-Fi с названием «Free Wi-Fi» или похожее на кафе/отель и перехватывают трафик.'
      },
      {
        term: 'Поддельный аккаунт на маркетплейсе (Spoofed marketplace account)',
        definition: 'Поддельный продавец или покупатель на маркетплейсе под видом реального человека.'
      },
      {
        term: 'Поддельный сервис «безопасной сделки» (Fake escrow)',
        definition: 'Псевдо-сервис, который обещает хранить деньги «до получения товара».\nНа самом деле это часть мошеннической схемы.'
      },
      {
        term: 'Подделка QR-кодов (QR code spoofing)',
        definition: 'Мошенники наклеивают поверх настоящего QR-кода свой — он ведёт на фейковый сайт или требует оплату.'
      },
      {
        term: 'Подделка сайта (Website spoofing)',
        definition: 'Создание фальшивой копии легитимного сайта для кражи данных пользователей.'
      },
      {
        term: 'Подсматривание через плечо (Shoulder surfing)',
        definition: 'Подглядывание за PIN-кодом или паролем.\n\nПростой, но эффективный способ: подсмотреть PIN-код или пароль в очереди, кафе, метро.'
      },
      {
        term: 'Подслушивание (Eavesdropping)',
        definition: 'Негласное прослушивание разговоров или перехват данных для получения конфиденциальной информации.'
      },
      {
        term: 'Пантографирование (skimming 2.0) (Skimming / Card skimming)',
        definition: 'Кража данных карты при бесконтактной оплате (редко, но возможно с плохой защитой).'
      },
      {
        term: 'Перехват SIM-карты (SIM-swapping)',
        definition: 'Мошенник перевыпускает вашу SIM-карту на себя (по поддельному паспорту).\nПолучает доступ к SMS-кодам и банковским операциям.'
      },
      {
        term: 'Претекстинг (мошенничество по легенде) (Pretexting)',
        definition: 'Создание правдоподобной истории (легенду), чтобы жертва добровольно раскрыла данные.\n\nПримеры легенд:\n\n«мы из банка, у вас подозрительная операция»\n\n«мы из техподдержки, на вашем компьютере вирус»\n\n«ваш родственник попал в беду»'
      }
    ]
  },
  {
    letter: 'Р',
    terms: [
      {
        term: 'Развод на инвестиции (Investment scam)',
        definition: 'Мошенники обещают «быстрый заработок» или «100% доход», часто под видом трейдинга, криптовалют, вложений в акции.\nСхема: вводят минимальный депозит, показывают «фальшивую прибыль», затем требуют всё больше денег и исчезают.'
      },
      {
        term: 'Робозвонок (Robocall)',
        definition: 'Автоматические звонки с записанным голосом, часто используются для массового фишинга.'
      },
      {
        term: 'Романтическое мошенничество (Romance scam)',
        definition: 'Обман через знакомство в интернете.\nМошенник втирается в доверие, потом просит денег «на билет», «на больницу», «на подарок».'
      },
      {
        term: 'Роутинг мошенников (Pharming)',
        definition: 'Перенаправление пользователя на поддельный сайт даже при правильном введении URL, часто через заражение DNS или устройства.'
      }
    ]
  },
  {
    letter: 'С',
    terms: [
      {
        term: 'Скимминг (Skimming)',
        definition: 'Сбор информации с банковских карт с помощью физических устройств (на банкомате) или виртуальных (в платежных системах).'
      },
      {
        term: 'Скидочный обман / Скидочные ловушки',
        definition: 'Сайты или магазины, предлагающие товары по подозрительно низкой цене.\nПосле оплаты:\n\nтовар не приходит\n\nили приходит подделка\n\nили уводят данные карты.'
      },
      {
        term: 'Скрытая загрузка вирусов (Drive-by download)',
        definition: 'Заражение устройства без клика — просто при посещении страницы.'
      },
      {
        term: 'Слэп-скрипты (SLAP scripts)',
        definition: 'Автоматизированные скрипты для массового рассылания мошеннических ссылок или сообщений.'
      },
      {
        term: 'Смс-фрод (SMS-fraud)',
        definition: 'Обман через SMS: подписки, мошеннические переводы, фишинг-ссылки.'
      }
    ]
  },
  {
    letter: 'Т',
    terms: [
      {
        term: 'Теневые данные (Shadow data)',
        definition: 'Данные, которые хранятся не в основной системе, а в облаках или сторонних сервисах — их часто взламывают.'
      },
      {
        term: 'Троян (Trojan)',
        definition: 'Вредоносная программа, замаскированная под легитимное ПО, выполняет скрытые действия: кражу данных, контроль устройства.'
      }
    ]
  },
  {
    letter: 'У',
    terms: [
      {
        term: 'Угрозы социальной инженерии',
        definition: 'Методы обмана, когда мошенник использует доверие человека, его эмоции, страх или желание получить выгоду.'
      },
      {
        term: 'Утечка данных (Data breach)',
        definition: 'Ситуация, когда крупная компания теряет базу данных пользователей (email, телефоны, пароли, карты).'
      }
    ]
  },
  {
    letter: 'Ф',
    terms: [
      {
        term: 'Фарминг (Pharming)',
        definition: 'Подмена адресов сайтов через DNS или заражение устройства, чтобы перенаправить пользователя на мошеннический сайт.'
      },
      {
        term: 'Фейк-аккаунт',
        definition: 'Поддельный профиль в соцсетях, мессенджерах или на маркетплейсах для обмана других пользователей.'
      },
      {
        term: 'Фишинг (Phishing)',
        definition: 'Метод получения личных данных через обманные письма, сайты или сообщения, маскирующиеся под официальные источники.'
      },
      {
        term: 'Фрод в интернет-платежах',
        definition: 'Любой вид мошенничества с электронными деньгами: карты, электронные кошельки, криптовалюта.'
      }
    ]
  },
  {
    letter: 'Х',
    terms: [
      {
        term: 'Хайджекинг (аккаунтов или сессий)',
        definition: 'Перехват учетной записи пользователя или активной сессии, чтобы получить доступ к деньгам или личной информации.'
      }
    ]
  },
  {
    letter: 'Ш',
    terms: [
      {
        term: 'Шантаж через персональные данные',
        definition: 'Мошенничество с угрозами публикации личной информации (компромат, интимные фото, переписки) для вымогательства денег.'
      }
    ]
  },
  {
    letter: 'Ч',
    terms: [
      {
        term: 'Чарджбэк-фрод',
        definition: 'Покупатель получает товар, а потом оспаривает платёж в банке, заявляя, что «не совершал покупку».\nВ итоге продавец теряет и товар, и деньги.'
      }
    ]
  }
];

export default function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Function to handle scroll events
    const handleScroll = () => {
      // Show button when scrolled more than 100px
      setShowScrollTop(window.scrollY > 100);
    };

    // Set initial state
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup function to remove event listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const alphabet = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Э', 'Ю', 'Я'];

  const filteredTerms = glossaryData.filter(section => {
    if (selectedLetter && section.letter !== selectedLetter) return false;
    if (searchTerm) {
      return section.terms.some(t =>
        t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.definition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen pt-8">
      <div className="container-custom">
        <div className="mb-12 animation-fade-in">
          <h1 className="section-title">Расширенный глоссарий по мошенничеству</h1>
          <p className="section-subtitle">
            Словарь терминов, связанных с мошенничеством и кибербезопасностью
          </p>
        </div>

        <div className="card-base p-6 mb-8">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Поиск по термину..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pr-10"
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-[#a0aec0] mb-4">Фильтр по букве:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLetter('')}
              className={`alphabet-filter-button ${selectedLetter === '' ? 'selected' : ''}`}
            >
              Все
            </button>
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`alphabet-filter-button ${selectedLetter === letter ? 'selected' : ''}`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {filteredTerms.map((section) => (
            <div key={section.letter}>
              <h2 className="letter-heading">
                {section.letter}
              </h2>
              <div className="space-y-4">
                {section.terms.map((item, index) => (
                  <div key={index} className="term-card animation-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <h3 className="term-title">
                      {item.term}
                    </h3>
                    <p className="term-definition whitespace-pre-line">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <div className="card-base p-12 text-center">
            <p className="text-[#a0aec0] mb-4">
              Термины не найдены
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLetter('');
              }}
              className="btn-secondary"
            >
              Очистить фильтры
            </button>
          </div>
        )}
      </div>

      {/* Scroll to top button - circular design with blue arrow positioned at bottom right */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full border border-[#00d9ff] flex items-center justify-center shadow-lg hover:bg-[#f0fcff] transition-all duration-300 z-50 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Наверх"
        style={{ 
          zIndex: 1000,
          borderRadius: '50%',
          border: '1px solid #00d9ff',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem'
        }}
      >
        <ArrowUp size={20} className="text-[#00d9ff]" style={{ color: '#00d9ff' }} />
      </button>
    </div>
  );
}