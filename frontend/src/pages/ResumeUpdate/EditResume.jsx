import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import TitleInput from "../../components/inputs/TitleInput.jsx";
import { useReactToPrint } from "react-to-print";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import {
    LuArrowLeft,
    LuCircleAlert,
    LuDownload,
    LuPalette,
    LuSave,
    LuTrash2,
} from "react-icons/lu";
import StepProgress from "../../components/StepProgress.jsx";
import ProfileInfoForm from "./Forms/ProfileInfoForm.jsx";
import ContactInfoForm from "./Forms/ContactInfoForm.jsx";
import WorkExperienceForm from "./Forms/WorkExperienceForm.jsx";
import EducationDetailsForm from "./Forms/EducationDetailsForm.jsx";
import SkillsInfoForm from "./Forms/SkillsInfoForm.jsx";
import ProjectsDetailForm from "./Forms/ProjectsDetailForm.jsx";
import CertificationInfoForm from "./Forms/CertificationInfoForm.jsx";
import AdditionalInfoForm from "./Forms/AdditionalInfoForm.jsx";
import RenderResume from "../../components/ResumeTemplates/RenderResume.jsx";
import toast from "react-hot-toast";
import {captureElementAsImage, dataURLtoFile, fixTailwindColors} from "../../utils/helper.js";
import Modal from "../../components/Modal.jsx";
import ThemeSelector from "./ThemeSelector.js";

const EditResume = () => {
    const { resumeId } = useParams();
    const navigate = useNavigate();

    const resumeRef = useRef(null);
    const resumeDownloadRef = useRef(null);

    const [baseWidth, setBaseWidth] = useState(800);
    const [openThemeSelector, setOpenThemeSelector] = useState(false);
    const [openPreviewModal, setOpenPreviewModal] = useState(false);
    const [currentPage, setCurrentPage] = useState("profile-info");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [resumeData, setResumeData] = useState({
        title: "",
        thumbnailLink: "",
        profileInfo: {
            profileImage: null,
            fullName: "",
            designation: "",
            summary: "",
        },
        template: {
            theme: "",
            colorPalette: "",
        },
        contactInfo: {
            email: "",
            phone: "",
            location: "",
            linkedin: "",
            github: "",
            website: "",
        },
        workExperience: [
            {
                company: "",
                role: "",
                startDate: "",
                endDate: "",
                description: "",
            },
        ],
        education: [
            {
                degree: "",
                institution: "",
                startDate: "",
                endDate: "",
            },
        ],
        skills: [
            {
                name: "",
                progress: 0,
            },
        ],
        projects: [
            {
                title: "",
                description: "",
                github: "",
                liveDemo: "",
            },
        ],
        certifications: [
            {
                title: "",
                issuer: "",
                year: "",
            },
        ],
        languages: [
            {
                name: "",
                progress: 0,
            },
        ],
        interests: [""],
    });

    // ------------------- VALIDATION -------------------
    const validateAndNext = () => {
        const errors = [];

        switch (currentPage) {
            case "profile-info": {
                const { fullName, designation, summary } = resumeData.profileInfo;
                if (!fullName.trim()) errors.push("Full Name is required.");
                if (!designation.trim()) errors.push("Designation is required.");
                if (!summary.trim()) errors.push("Summary is required.");
                break;
            }

            case "contact-info": {
                const { email, phone } = resumeData.contactInfo;
                if (!email.trim()) errors.push("Valid Email is required.");
                if (!phone.trim()) errors.push("Valid Phone number is required.");
                break;
            }

            case "work-experience": {
                resumeData.workExperience.forEach(
                    ({ company, role, startDate, endDate }, index) => {
                        if (!company.trim())
                            errors.push(`Company name is required for work experience #${index + 1}.`);
                        if (!role.trim())
                            errors.push(`Role is required for work experience #${index + 1}.`);
                        if (!startDate.trim())
                            errors.push(`Start Date is required for work experience #${index + 1}.`);
                        if (!endDate.trim())
                            errors.push(`End Date is required for work experience #${index + 1}.`);
                    }
                );
                break;
            }

            case "education-info": {
                resumeData.education.forEach(
                    ({ degree, institution, startDate, endDate }, index) => {
                        if (!degree.trim()) errors.push(`Degree is required for education #${index + 1}.`);
                        if (!institution.trim())
                            errors.push(`Institution is required for education #${index + 1}.`);
                        if (!startDate.trim())
                            errors.push(`Start Date is required for education #${index + 1}.`);
                        if (!endDate.trim())
                            errors.push(`End Date is required for education #${index + 1}.`);
                    }
                );
                break;
            }

            case "skills": {
                resumeData.skills.forEach(({ name }, index) => {
                    if (!name.trim()) errors.push(`Skill name is required for skill #${index + 1}.`);
                });
                break;
            }

            case "projects": {
                resumeData.projects.forEach(({ title, description }, index) => {
                    if (!title.trim()) errors.push(`Title is required for project #${index + 1}.`);
                    if (!description.trim())
                        errors.push(`Description is required for project #${index + 1}.`);
                });
                break;
            }

            case "certifications":
                resumeData.certifications.forEach(({ title, issuer }, index) => {
                    if (!title.trim())
                        errors.push(`Certification Title is required for certification #${index + 1}.`);
                    if (!issuer.trim())
                        errors.push(`Issuer is required for certification #${index + 1}.`);
                });
                break;

            case "additionalInfo":
                if (resumeData.languages.length === 0 || !resumeData.languages[0].name?.trim()) {
                    errors.push(`At least one language is required.`);
                }

                if (resumeData.interests.length === 0 || !resumeData.interests[0]?.trim()) {
                    errors.push(`At least one interest is required.`);
                }
                break;

            default:
                break;
        }

        if (errors.length > 0) {
            setErrorMsg(errors.join(", "));
            return;
        }

        setErrorMsg("");
        goToNextStep();
    };

    // ------------------- PAGE NAVIGATION -------------------
    const goToNextStep = () => {
        const pages = [
            "profile-info",
            "contact-info",
            "work-experience",
            "education-info",
            "skills",
            "projects",
            "certifications",
            "additionalInfo",
        ];

        const currentIndex = pages.indexOf(currentPage);
        if (currentIndex !== -1 && currentIndex < pages.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentPage(pages[nextIndex]);
            const percent = Math.round((nextIndex / (pages.length - 1)) * 100);
            setProgress(percent);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            setOpenPreviewModal(true);
        }
    };

    const goBack = () => {
        const pages = [
            "profile-info",
            "contact-info",
            "work-experience",
            "education-info",
            "skills",
            "projects",
            "certifications",
            "additionalInfo",
        ];

        const currentIndex = pages.indexOf(currentPage);
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentPage(pages[prevIndex]);
            const percent = Math.round((prevIndex / (pages.length - 1)) * 100);
            setProgress(percent);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // ------------------- FORM HANDLERS -------------------
    const updateSection = (section, key, value) => {
        setResumeData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            },
        }));
    };

    const updateArrayItem = (section, index, key, value) => {
        setResumeData((prev) => {
            const updatedArray = [...prev[section]];
            if (key === null) {
                updatedArray[index] = value;
            } else {
                updatedArray[index] = {
                    ...updatedArray[index],
                    [key]: value,
                };
            }
            return { ...prev, [section]: updatedArray };
        });
    };

    const addArrayItem = (section, newItem) => {
        setResumeData((prev) => ({
            ...prev,
            [section]: [...prev[section], newItem],
        }));
    };

    const removeArrayItem = (section, index) => {
        setResumeData((prev) => {
            const updatedArray = [...prev[section]];
            updatedArray.splice(index, 1);
            return { ...prev, [section]: updatedArray };
        });
    };

    // ------------------- API -------------------
    const fetchResumeDetailsById = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.RESUME.GET_BY_ID(resumeId));
            if (response.data && response.data.profileInfo) {
                const resumeInfo = response.data;
                setResumeData((prev) => ({
                    ...prev,
                    ...resumeInfo,
                }));
            }
        } catch (err) {
            console.log(err);
        }
    };

    const uploadResumeImages = async () => {
        try{
            setIsLoading(true);


            fixTailwindColors(resumeRef.current);
            const imageDataUrl = await captureElementAsImage(resumeRef.current);

            const thumbnailFile = dataURLtoFile(
                imageDataUrl, `resume=${resumeId}.png`
            );

            const profileImageFile = resumeData?.profileInfo?.profileImage || null;

            const formData = new FormData();
            if(profileImageFile) formData.append("profileImage", profileImageFile);
            if(thumbnailFile) formData.append("thumbnail", thumbnailFile);

            const uploadResponse = await axiosInstance.put(
                API_PATHS.RESUME.UPLOAD_IMAGES(resumeId),
                formData,
                {
                    headers: {"Content-Type": "multipart/form-data"},
                }
            )

            const {thumbnailLink, profilePreviewUrl} = uploadResponse.data;
            console.log("RESUME DATA---", resumeData)

            await updateResumeDetails({thumbnailLink, profilePreviewUrl});

            toast.success("Resume updated Successfully!");
            navigate("/dashboard");
        }catch(err){
            console.error("Error uploading images:" ,err);
            toast.error("Error uploading images!");
        }finally {
            setIsLoading(false);
        }
    };
    const updateResumeDetails = async ({thumbnailLink, profilePreviewUrl}) => {
        try{
            setIsLoading(true);

            console.log(resumeData.profileInfo + "updated")

            const response = await axiosInstance.put(
                API_PATHS.RESUME.UPDATE(resumeId),
                {
                    ...resumeData,
                    thumbnailLink: thumbnailLink || "",
                    profileInfo: {
                        ...resumeData.profileInfo,
                        profilePreviewUrl: profilePreviewUrl || "",
                    }
                }
            )



        }catch(err){
            console.error("Error capturing image: ", err);
        }finally {
            setIsLoading(false);
        }
    };
    const handleDeleteResume = async () => {};

    const reactToPrintFn = useReactToPrint({ contentRef: resumeDownloadRef });

    const updateBaseWidth = () => {
        if (resumeRef.current) setBaseWidth(resumeRef.current.offsetWidth);
    };

    useEffect(() => {
        updateBaseWidth();
        window.addEventListener("resize", updateBaseWidth);
        if (resumeId) fetchResumeDetailsById();
        return () => window.removeEventListener("resize", updateBaseWidth);
    }, []);

    // ------------------- FORM RENDER -------------------
    const renderForm = () => {
        switch (currentPage) {
            case "profile-info":
                return (
                    <ProfileInfoForm
                        profileData={resumeData.profileInfo}
                        updateSection={(key, value) => updateSection("profileInfo", key, value)}
                        onNext={validateAndNext}
                    />
                );
            case "contact-info":
                return (
                    <ContactInfoForm
                        contactInfo={resumeData.contactInfo}
                        updateSection={(key, value) => updateSection("contactInfo", key, value)}
                    />
                );
            case "work-experience":
                return (
                    <WorkExperienceForm
                        workExperience={resumeData.workExperience}
                        updateArrayItem={(index, key, value) =>
                            updateArrayItem("workExperience", index, key, value)
                        }
                        addArrayItem={(newItem) => addArrayItem("workExperience", newItem)}
                        removeArrayItem={(index) => removeArrayItem("workExperience", index)}
                    />
                );
            case "education-info":
                return (
                    <EducationDetailsForm
                        educationInfo={resumeData.education}
                        updateArrayItem={(index, key, value) =>
                            updateArrayItem("education", index, key, value)
                        }
                        addArrayItem={(newItem) => addArrayItem("education", newItem)}
                        removeArrayItem={(index) => removeArrayItem("education", index)}
                    />
                );
            case "skills":
                return (
                    <SkillsInfoForm
                        skillsInfo={resumeData.skills}
                        updateArrayItem={(index, key, value) =>
                            updateArrayItem("skills", index, key, value)
                        }
                        addArrayItem={(newItem) => addArrayItem("skills", newItem)}
                        removeArrayItem={(index) => removeArrayItem("skills", index)}
                    />
                );
            case "projects":
                return (
                    <ProjectsDetailForm
                        projectsInfo={resumeData.projects}
                        updateArrayItem={(index, key, value) =>
                            updateArrayItem("projects", index, key, value)
                        }
                        addArrayItem={(newItem) => addArrayItem("projects", newItem)}
                        removeArrayItem={(index) => removeArrayItem("projects", index)}
                    />
                );
            case "certifications":
                return (
                    <CertificationInfoForm
                        certifications={resumeData.certifications}
                        updateArrayItem={(index, key, value) =>
                            updateArrayItem("certifications", index, key, value)
                        }
                        addArrayItem={(newItem) => addArrayItem("certifications", newItem)}
                        removeArrayItem={(index) => removeArrayItem("certifications", index)}
                    />
                );
            case "additionalInfo":
                return (
                    <AdditionalInfoForm
                        languages={resumeData.languages}
                        interests={resumeData.interests}
                        updateArrayItem={(section, index, key, value) =>
                            updateArrayItem(section, index, key, value)
                        }
                        addArrayItem={(section, newItem) => addArrayItem(section, newItem)}
                        removeArrayItem={(section, index) => removeArrayItem(section, index)}
                    />
                );
            default:
                return null;
        }
    };

    // ------------------- RENDER -------------------
    return (
        <DashboardLayout>
            <div className="container mx-auto">
                {/* HEADER BAR */}
                <div className="flex items-center justify-between gap-5 bg-white rounded-lg border border-purple-100 py-3 px-4 mb-4">
                    <TitleInput
                        title={resumeData.title}
                        setTitle={(value) =>
                            setResumeData((prev) => ({ ...prev, title: value }))
                        }
                    />
                    <div className="flex items-center gap-4">
                        <button
                            className="btn-small-light"
                            onClick={() => setOpenThemeSelector(true)}
                        >
                            <LuPalette className="text-[16px]" />
                            <span className="hidden md:block">Change Theme</span>
                        </button>
                        <button className="btn-small-light" onClick={handleDeleteResume}>
                            <LuTrash2 className="text-[16px]" />
                            <span className="hidden md:block">Delete</span>
                        </button>
                        <button
                            className="btn-small-light"
                            onClick={() => setOpenPreviewModal(true)}
                        >
                            <LuDownload className="text-[16px]" />
                            <span className="hidden md:block">Preview & Download</span>
                        </button>
                    </div>
                </div>

                {/* MAIN GRID: FORM + PREVIEW */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* LEFT FORM */}
                    <div className="bg-white rounded-lg border border-purple-100 overflow-hidden">
                        <StepProgress progress={progress} />
                        {renderForm()}

                        <div className="mx-5">
                            {errorMsg && (
                                <div className="flex items-center gap-2 text-[11px] font-medium text-amber-600 bg-amber-100 px-2 py-0.5 my-1 rounded">
                                    <LuCircleAlert className="text-md" /> {errorMsg}
                                </div>
                            )}
                            <div className="flex items-end justify-end gap-3 mt-3 mb-5">
                                <button
                                    className="btn-small-light"
                                    onClick={goBack}
                                    disabled={isLoading}
                                >
                                    <LuArrowLeft className="text-[16px]" />
                                    Back
                                </button>

                                <button
                                    className="btn-small-light"
                                    onClick={uploadResumeImages}
                                    disabled={isLoading}
                                >
                                    <LuSave className="text-[16px]" />
                                    {isLoading ? "Updating" : "Save & Exit"}
                                </button>

                                <button
                                    className="btn-small"
                                    onClick={validateAndNext}
                                    disabled={isLoading}
                                >
                                    {currentPage === "additionalInfo" && (
                                        <LuDownload className="text-[16px]" />
                                    )}
                                    {currentPage === "additionalInfo"
                                        ? "Preview & Download"
                                        : "Next"}
                                    {currentPage === "additionalInfo" && (
                                        <LuArrowLeft className="text-[16px] rotate-180" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT RESUME PREVIEW */}
                    <div
                        ref={resumeRef}
                        className="bg-white rounded-lg border border-purple-100 overflow-hidden flex justify-center items-start"
                    >
                        <RenderResume
                            templateId={resumeData?.template?.theme || ""}
                            resumeData={resumeData}
                            colorPalette={resumeData?.template?.colorPalette || []}
                            containerWidth={baseWidth}
                        />
                    </div>
                </div>
            </div>

            <Modal isOpen={openThemeSelector} onClose={() => setOpenThemeSelector(false)}
                   title={"Change Theme"}
                   >
                <div className={"w-[90vw] h-[80vh]"}>
                    <ThemeSelector
                        selectedTheme={resumeData?.template}
                        setSelectedTheme={(value) =>{
                            setResumeData((prevState) => (
                                {
                                    ...prevState, template: value || prevState.template
                                }
                            ));
                        }}
                        resumeData={null} onClose={() => setOpenThemeSelector(false)} />
                </div>
            </Modal>

            <Modal isOpen={openPreviewModal} onClose={() => setOpenPreviewModal(false)}
                   title={resumeData.title}
                   showActionBtn
                   actionBtnText={"Download"}
                   actionBtnIcon={<LuDownload className={'text-[16px]'} />}
                   onActionClick={() => reactToPrintFn()}>
                <div ref={resumeDownloadRef} className={"w-[98vw] h-[90vh]"}>
                    <RenderResume
                        templateId={resumeData.template?.theme || ""}
                        resumeData={resumeData}
                        colorPalette={resumeData?.template?.colorPalette || []} />
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default EditResume;
