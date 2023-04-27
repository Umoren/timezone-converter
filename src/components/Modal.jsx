const Modal = ({ isOpen, onClose, meetingLink }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>
                <div className="bg-white rounded-lg px-4 pt-5 pb-4 shadow-xl transform sm:max-w-sm sm:w-full sm:p-6">
                    <div className="text-center">
                        <img
                            src="/desertisland.jpeg"
                            alt="Desert Island"
                            className="w-full h-20 mx-auto mb-4"
                        />
                        <h3 className="text-xl font-bold mb-2">Meeting Time!</h3>
                        <p>Yes! it's meeting time on the Desert Island </p>
                        <a
                            href={meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 mt-4"
                        >
                            Join the meeting
                        </a>
                    </div>
                    <div className="mt-5 sm:mt-6">
                        <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Modal