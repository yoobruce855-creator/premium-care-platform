import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import '../styles/LanguageSelector.css';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' }
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    return (
        <div className="language-selector">
            <Globe size={18} />
            <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="language-dropdown"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;
