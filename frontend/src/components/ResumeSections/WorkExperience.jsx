const WorkExperience = ({
    company, role, duration, description, durationColor
                        }) => {
    return (
        <>
            <div className={"mb-5"}>
                <div className={"flex items-start justify-between"}>
                    <div>
                        <h3 className={"text-[15px] font-semibold text-gray-900"}>
                            {company}
                        </h3>

                        <p className={"text-[12px] font-semibold text-gray-900"}>
                            {role}
                        </p>
                    </div>

                    <p className={"text-xs text-gray-600 font-medium italic mt-[0.2cqw]"}>
                        {duration}
                    </p>
                </div>

                <p className={"text-[12px]"}>
                    {description}
                </p>
            </div>
        </>
    )
}

export default WorkExperience;