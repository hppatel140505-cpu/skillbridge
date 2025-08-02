import React, { useContext, useEffect, useState }  from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube'
import Rating from '../../components/students/Rating'


const Player = () => {
  const { enrolledCourses, calculateChapterTime } = useContext(AppContext);
  const { courseId } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);

  const getCourseData = () => {
    const course = enrolledCourses.find((course) => course._id === courseId);
    if (course) setCourseData(course);
  };

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    getCourseData();
  }, [enrolledCourses]);

  return (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* left column */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>
          <div className="pt-10">
            {courseData &&
              courseData.courseContent.map((chapter, index) => (
                <div
                  key={index}
                  className="border border-gray-300 bg-white mb-3 rounded"
                >
                  <div
                    className="flex justify-between items-center px-4 py-3 cursor-pointer"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={assets.down_arrow_icon}
                        alt="arrow"
                        className={`transition-transform w-4 ${
                          openSections[index] ? "rotate-180" : ""
                        }`}
                      />
                      <p className="font-medium text-sm md:text-base">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className="text-sm md:text-base">
                      {chapter.chapterContent.length} lectures -{" "}
                      {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      openSections[index] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <ul className="border-t border-gray-300 py-2 px-5 text-sm text-gray-600 list-disc">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li
                          key={i}
                          className="flex justify-between items-center py-1"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                false
                                  ? assets.blue_tick_icon
                                  : assets.play_icon
                              }
                              alt="play"
                              className="w-4 h-4 mt-0.5"
                            />
                            <span className="text-gray-800">
                              {lecture.lectureTitle}
                            </span>
                          </div>
                          <div className="flex gap-2 text-xs md:text-sm text-gray-500">
                            {lecture.lectureUrl && (
                              <span
                                onClick={() =>
                                  setPlayerData({
                                    ...lecture,
                                    chapter: index + 1,
                                    lecture: i + 1,
                                  })
                                }
                                className="text-blue-500 cursor-pointer"
                              >
                                Watch
                              </span>
                            )}
                            <span>
                              {humanizeDuration(
                                lecture.lectureDuration * 60000,
                                {
                                  units: ["h", "m"],
                                }
                              )}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
          </div>

          {/* ratig course  */}
          <div className='flex items-center gap-2 py-3 mt-10'>
          <h1 className='text-xl font-bold'>Rate this Course:</h1>
          <Rating initialRating={0}/>
          </div>
          
        </div>

        

        {/* right column */}
        <div className='md:mt-10'>
          {playerData ? (
            <div>
              <YouTube videoId={playerData.lectureUrl.split('/').pop()}  iframeClassName="w-full aspect-video"/>
             <div className='flex justify-between items-center mt-1'>
              <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
              <button className='text-blue-600'>{ false ? 'Completed' : 'Mark Complete'}</button>
            </div>
            </div>
          )

           : <img src={courseData ? courseData.courseThumbnail : ''} alt="" />
          }
        </div>


      </div>
    </>
  );
};


export default Player
