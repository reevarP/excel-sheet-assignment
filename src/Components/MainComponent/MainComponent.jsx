import React, { useEffect, useRef, useState } from "react";
import styles from "./mainComponent.module.css";

const MainComponent = () => {
    const fileUploadRef = useRef(null);

    const handleClick = () => {
        fileUploadRef.current.click();
    };

    const [excelData, setExcelData] = useState([]);
    const [errorArray, setErrorArray] = useState([]);

    const readExcelFile = (file) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = event.target.result;

            // Process the data (assuming CSV format here)
            const rows = data.split("\n");
            const parsedData = rows
                .map((row) => row.split(","))
                .filter((row) => {
                    return row[0] !== "";
                });
            const newArray = parsedData.map((curElem, index) => {
                return {
                    email: curElem[0],
                    fullName: curElem[1],
                    role: curElem[2],
                    reportsTo: curElem[3] ? curElem[3].replace("\r", "") : "",
                };
            });
            setExcelData(newArray.slice(1));
        };

        reader.readAsText(file);
    };

    const handleFileUpload = (event) => {
        const { files } = event.target;
        if (files[0]) {
            readExcelFile(files[0]);
        }
    };

    useEffect(() => {
        if (excelData.length > 0) {
            //looping to confirm there is only one root
            let rootUser = [];
            excelData.forEach((curElem) => {
                if (curElem.role === "Root") {
                    rootUser.push(curElem);
                }
            });
            if (rootUser.length < 1) {
                setErrorArray((prev) => {
                    return [...prev, "There are no root"];
                });
            }
            if (rootUser.length > 1) {
                setErrorArray((prev) => {
                    return [...prev, "There cannot be more than one root"];
                });
            }

            if (rootUser.length === 1) {
                excelData.forEach((curElem) => {
                    const reportingToUser = excelData.filter((cur) => {
                        return curElem.reportsTo.includes(cur.email);
                    });

                    if (reportingToUser.length > 1) {
                        setErrorArray((prev) => {
                            return [...prev, `${curElem.fullName} reports to more than one user which is not allowed`];
                        });
                    } else {
                        if (curElem.role === "Admin") {
                            if (reportingToUser[0].role !== "Root") {
                                setErrorArray((prev) => {
                                    return [...prev, `${curElem.fullName} is an Admin but is reporting ${reportingToUser[0].fullName} who is ${reportingToUser[0].role}`];
                                });
                            }
                        }
                        if (curElem.role === "Manager") {
                            if (reportingToUser[0].role !== "Manager" && reportingToUser[0].role !== "Admin") {
                                setErrorArray((prev) => {
                                    return [
                                        ...prev,
                                        `${curElem.fullName} is a Manager but is reporting ${reportingToUser[0].fullName} who is ${reportingToUser[0].role} and neither Admin nor Manager`,
                                    ];
                                });
                            }
                        }
                        if (curElem.role === "Caller") {
                            if (reportingToUser[0].role !== "Manager") {
                                setErrorArray((prev) => {
                                    return [...prev, `${curElem.fullName} is a Caller but is reporting ${reportingToUser[0].fullName} who is ${reportingToUser[0].role} and not Manager`];
                                });
                            }
                        }
                    }
                });
            }
        }
    }, [excelData]);
    return (
        <div className="main-container">
            <div className={styles.container}>
                <div className={styles.contentBox}>
                    <div className={styles.heading}>Upload Excel Sheet</div>
                    <div className={styles.description}>Upload an Excel Sheet to analyze it.</div>
                    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                        <button className={styles.uploadButton} onClick={handleClick}>
                            Click To Upload
                        </button>
                        <input type="file" ref={fileUploadRef} style={{ display: "none" }} onChange={handleFileUpload} />
                    </div>
                    {errorArray.length > 0 && (
                        <div style={{ width: "80%" }}>
                            <div className={styles.errorHead}>There are errors</div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {errorArray.map((curElem) => {
                                    return <div className={styles.eachError}>{curElem}</div>;
                                })}
                            </div>
                        </div>
                    )}
                    {excelData.length > 0 && errorArray.length === 0 && (
                        <div style={{ width: "80%", marginTop: "0.5rem" }}>
                            <div className={styles.noErrors}>No errors found</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainComponent;
