import Progress from "../ResumeTemplates/Progress.jsx";


const LanguageInfo = ({language, progress, bgColor, accentColor}) => {
    return (
        <div className={"flex items-center justify-between"}>
            <p className={"text-[12px] font-semibold text-gray-900"}>
                {language}
            </p>
            {
                progress > 0 && (
                    <Progress
                        progress={(progress / 100) * 5}
                        color={accentColor}
                        bgColor={bgColor} />
                )
            }
        </div>
    )
}

const LanguageSection = ({languages, bgColor, accentColor}) => {
    return (
        <>
            <div className={"flex flex-col gap-2"}>
                {
                    languages?.map((language, index) => (
                        <LanguageInfo
                        key={`language-${index}`}
                        language={language.name}
                        progress={language.progress}
                        bgColor={bgColor}
                        accentColor={accentColor} />
                    ))
                }
            </div>
        </>
    )
};

export default LanguageSection;