import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import axiosInstance from "../../utils/axiosInstance.js";
import {API_PATHS} from "../../utils/apiPaths.js";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import {LuCirclePlus} from "react-icons/lu";
import moment from "moment";
import ResumeSummaryCard from "../../components/Cards/ResumeSummaryCard.jsx";
import Modal from "../../components/Modal.jsx";
import CreateResumeForm from "./CreateResumeForm.jsx";

const Dashboard = () => {

    const navigate = useNavigate();

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [allResume, setAllResume] = useState(null);

    const fetchAllResumes = async () => {
        try{
            const response = await axiosInstance.get(API_PATHS.RESUME.GET_ALL);
            setAllResume(response.data);
        }catch(e){
            console.error(e);
        }
    };

    useEffect(() => {
        fetchAllResumes()
    }, []);

    return (
        <DashboardLayout>
            <div className={"grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-7 pt-1 pb-6 px-4 md:px-0"}>
                <div className={"h-[300px] flex flex-col gap-5 items-center justify-center bg-white rounded-lg border border-purple-100 hover:border-purple-300 hover:bg-purple-50/5 cursor-pointer"}
                     onClick={() => {
                         setOpenCreateModal(true);
                     }}>
                    <div className={"w-12 h-12 flex items-center justify-center bg-purple-200/60 rounded-2xl"}>
                        <LuCirclePlus className={"text-xl text-purple-500"} />
                    </div>

                    <h3 className={"font-medium text-gray-800"}>Add new resume</h3>
                </div>

                {
                    allResume?.map(resume => {
                        return <ResumeSummaryCard
                            key={resume?._id}
                            imgUrl={resume?.thumbnailLink || null}
                            title={resume?.title||"fd"}
                            lastUpdated={
                            resume?.updatedAt ? moment(resume.updatedAt).format("DD MM YYYY") : ""
                            }
                            onSelect={()=> navigate(`/resume/${resume?._id}`)}
                            />
                    })
                }
            </div>

            <Modal
                isOpen={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                hideHeader >

            <div>
                <CreateResumeForm />
            </div>
            </Modal>
        </DashboardLayout>
    )
}

export default Dashboard;