import React, { useContext, useEffect, useRef, useState } from "react";
import uniqid from "uniqid";
import Quill from "quill";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const AddCourse = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapter, setChapter] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
  });

  const [lectureVideo, setLectureVideo] = useState(null); // ✅ for video file

  // ------------------------- Chapter handlers
  const handleChapter = (action, chapterId) => {
    if (action === "add") {
      const title = prompt("Enter Chapter Name:");
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder:
            chapter.length > 0 ? chapter.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapter([...chapter, newChapter]);
      }
    } else if (action === "remove") {
      setChapter(chapter.filter((ch) => ch.chapterId !== chapterId));
    } else if (action === "toggle") {
      setChapter(
        chapter.map((ch) =>
          ch.chapterId === chapterId ? { ...ch, collapsed: !ch.collapsed } : ch
        )
      );
    }
  };

  // ------------------------- Lecture handlers
  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === "add") {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === "remove") {
      setChapter(
        chapter.map((ch) => {
          if (ch.chapterId === chapterId) {
            const updatedContent = [...ch.chapterContent];
            updatedContent.splice(lectureIndex, 1);
            return { ...ch, chapterContent: updatedContent };
          }
          return ch;
        })
      );
    }
  };

  const addLecture = () => {
    setChapter(
      chapter.map((ch) => {
        if (ch.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder:
              ch.chapterContent.length > 0
                ? ch.chapterContent.slice(-1)[0].lectureOrder + 1
                : 1,
            lectureId: uniqid(),
          };
          return { ...ch, chapterContent: [...ch.chapterContent, newLecture] };
        }
        return ch;
      })
    );

    setShowPopup(false);
    setLectureDetails({
      lectureTitle: "",
      lectureDuration: "",
      lectureUrl: "",
      isPreviewFree: false,
    });
    setLectureVideo(null);
  };

  // ------------------------- Upload Lecture Video to backend
  const uploadLectureVideoToServer = async () => {
    if (!lectureVideo) {
      toast.error("Please select a video!");
      return;
    }
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("video", lectureVideo);

      const { data } = await axios.post(
        backendUrl + "/api/educator/upload-lecture-video",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setLectureDetails({
          ...lectureDetails,
          lectureUrl: data.videoUrl,
          lectureDuration: Math.ceil(data.duration / 60),
        });
        toast.success("Video uploaded successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ------------------------- Submit Course
  const handelSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error("Thumbnail Not Selected");
      return;
    }

    const courseData = {
      courseTitle,
      courseDescription: quillRef.current.root.innerHTML,
      coursePrice: Number(coursePrice),
      discount: Number(discount),
      courseContent: chapter,
    };

    try {
      const formData = new FormData();
      formData.append("courseData", JSON.stringify(courseData));
      formData.append("image", image);

      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + "/api/educator/add-course",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setCourseTitle("");
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapter([]);
        quillRef.current.root.innerHTML = "";
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ------------------------- Quill init
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: "snow" });
    }
  }, []);

  return (
    <div className="h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <form
        onSubmit={handelSubmit}
        className="flex flex-col gap-4 max-w-md w-full text-gray-500"
      >
        {/* Course title */}
        <div className="flex flex-col gap-1">
          <p>Course Title</p>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
            required
          />
        </div>

        {/* Course Description */}
        <div className="flex flex-col gap-1">
          <p>Course Description</p>
          <div ref={editorRef}></div>
        </div>

        {/* Price, Thumbnail, Discount */}
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex flex-col gap-1">
            <p>Course Price</p>
            <input
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
              required
            />
          </div>

          <div className="flex md:flex-row flex-col items-center gap-3">
            <p>Course Thumbnail</p>
            <label
              htmlFor="thumbnailImage"
              className="flex items-center gap-3 cursor-pointer"
            >
              <img
                src={assets.file_upload_icon}
                alt=""
                className="p-3 bg-blue-500 rounded"
              />
              <input
                type="file"
                id="thumbnailImage"
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
                hidden
              />
              <img
                className="max-h-10"
                src={image ? URL.createObjectURL(image) : ""}
                alt=""
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p>Discount %</p>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            type="number"
            placeholder="0"
            min={0}
            max={100}
            className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
            required
          />
        </div>

        {/* Chapters and Lectures */}
        <div>
          {chapter.map((ch, chapterIndex) => (
            <div key={chapterIndex} className="bg-white border rounded-lg mb-4">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center">
                  <img
                    onClick={() => handleChapter("toggle", ch.chapterId)}
                    src={assets.dropdown_icon}
                    width={14}
                    alt=""
                    className={`mr-2 cursor-pointer transition-all ${
                      ch.collapsed ? "-rotate-90" : ""
                    }`}
                  />
                  <span className="font-semibold">
                    {chapterIndex + 1} {ch.chapterTitle}
                  </span>
                </div>
                <span className="text-gray-500">
                  {ch.chapterContent.length} Lectures
                </span>
                <img
                  src={assets.cross_icon}
                  alt=""
                  onClick={() => handleChapter("remove", ch.chapterId)}
                  className="cursor-pointer"
                />
              </div>

              {!ch.collapsed && (
                <div className="p-4">
                  {ch.chapterContent.map((lecture, lectureIndex) => (
                    <div
                      key={lectureIndex}
                      className="flex justify-between items-center mb-2"
                    >
                      <span>
                        {lecture.lectureTitle} - {lecture.lectureDuration} mins -{" "}
                        <a
                          href={lecture.lectureUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500"
                        >
                          Link
                        </a>{" "}
                        - {lecture.isPreviewFree ? "Free Preview" : "Paid"}
                      </span>
                      <img
                        src={assets.cross_icon}
                        alt=""
                        onClick={() =>
                          handleLecture("remove", ch.chapterId, lectureIndex)
                        }
                        className="cursor-pointer"
                      />
                    </div>
                  ))}

                  <div
                    className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2"
                    onClick={() => handleLecture("add", ch.chapterId)}
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}

          <div
            className="flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer"
            onClick={() => handleChapter("add")}
          >
            + Add Chapter
          </div>

          {/* ---------------------- Lecture popup */}
          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white text-gray-700 p-4 rounded relative w-full max-w-80">
                <h2 className="text-lg font-semibold mb-4">Add Lecture</h2>

                <div className="mb-2">
                  <p>Lecture Title</p>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded py-1 px-2"
                    value={lectureDetails.lectureTitle}
                    onChange={(e) =>
                      setLectureDetails({
                        ...lectureDetails,
                        lectureTitle: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mb-2">
                  <p>Lecture Video</p>
                  <input
                    type="file"
                    accept="video/*"
                    className="mt-1 block w-full border rounded py-1 px-2"
                    onChange={(e) => setLectureVideo(e.target.files[0])}
                  />
                  <button
                    type="button"
                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={uploadLectureVideoToServer}
                  >
                    Upload Video
                  </button>
                  {lectureDetails.lectureUrl && (
                    <p className="text-green-500 mt-1">
                      Uploaded URL: {lectureDetails.lectureUrl}
                    </p>
                  )}
                </div>

                <div>
                  <p>Is Preview Free?</p>
                  <input
                    type="checkbox"
                    className="mt-1 scale-125"
                    checked={lectureDetails.isPreviewFree}
                    onChange={(e) =>
                      setLectureDetails({
                        ...lectureDetails,
                        isPreviewFree: e.target.checked,
                      })
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!lectureDetails.lectureUrl) {
                      toast.error("Please upload video first!");
                      return;
                    }
                    addLecture();
                  }}
                  className="w-full bg-blue-400 text-white px-4 py-2 rounded mt-3"
                >
                  Add Lecture
                </button>

                <img
                  onClick={() => setShowPopup(false)}
                  src={assets.cross_icon}
                  alt=""
                  className="absolute top-4 right-4 w-4 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-black text-white w-max py-2.5 px-8 rounded my-4"
        >
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddCourse;
