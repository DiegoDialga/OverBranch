import ProfilePhotoSelector from "../../../components/inputs/ProfilePhotoSelector.jsx";
import Input from "../../../components/inputs/input.jsx";

const ProfileInfoForm = ({profileData, updateSection, onNext}) => {
    return(
        <div className={"px-5 pt-5"}>
            <h2 className={"text-lg font-semibold text-gray-900"}>
                Personal Information
            </h2>

            <div className={"mt-4"}>
                <ProfilePhotoSelector
                    image={profileData?.profileImage || profileData?.profileImageUrl}
                    onNext={onNext} setImage={(value) => {
                        updateSection("profileImage", value)}}
                    preview={profileData?.profilePreviewUrl}
                    setPreview={(value) => updateSection("profilePreviewUrl", value)} />

                <div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
                    <Input
                        value={profileData.fullName || ""}
                        onChange={({target}) => updateSection("fullName", target.value)}
                        label={"Full Name"}
                        placeholder={"John"}
                        type={"text"} />

                    <Input value={profileData.designation || ""}
                           onChange={({target}) => updateSection("designation", target.value)}
                           label={"Designation"}
                           placeholder={"UI Designer"}
                           type={"text"} />

                    <div className={"cols-span-2 mt-3"}>
                        <label className={"text-xs font-medium text-slate-600"}>
                            Summary
                        </label>

                        <textarea
                            placeholder="Short Introduction"
                            rows={4}
                            value={profileData.summary || ""}
                            onChange={({ target }) => updateSection("summary", target.value)}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400  focus:outline-none focus:border-gray-400 focus:ring-0 resize-y transition-colors duration-150"
                        />

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileInfoForm;