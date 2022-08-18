import { Button, Checkbox, FormControlLabel, FormGroup, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import SimpleDialog from './SimpleDialog';

function FileUploadPage() {

    const [selectedFile, setSelectedFile] = useState([]);
    const [errorMessage, setErrorMessage] = useState();
    const reader = new FileReader();
    const [open, setOpen] = React.useState(false);
    const [clickedItem, setClickedItem] = React.useState();
    const [clickedItemIndex, setClickedItemIndex] = React.useState();
    const [clickedItemMainIndex, setClickedItemMainIndex] = React.useState();
    const [itemFound, setItemFound] = useState([]);
    const [checkbox, setCheckBox] = useState([]);

    const toggleCheckBox = (objectIndex, arrayIndex, item, topic) => {

        let tmp = [...checkbox];
        if (tmp[objectIndex]?.includes(arrayIndex)) {
            tmp[objectIndex] = tmp[objectIndex].filter(index => index !== arrayIndex)
        }
        else {
            tmp[objectIndex].push(arrayIndex);
        }
        setCheckBox(tmp)
    }


    const handleClickOpen = (e, item, mainItemIndex, itemIndex, topic) => {
        e.stopPropagation();
        setOpen(true);
        setClickedItem(item)
        setClickedItemIndex(itemIndex)
        setClickedItemMainIndex(mainItemIndex);
        // console.log(checkbox)
        toggleCheckBox(mainItemIndex, itemIndex, item, topic);
    }

    // read JSON file
    const changeHandler = (e) => {
        reader.onload = (e) => {
            const text = e.target.result;
            setSelectedFile(JSON.parse(text));
            const checkboxArray = [];
            Object.keys(JSON.parse(text)).map((item) => {
                return checkboxArray.push([]);
            })
            setCheckBox(checkboxArray)
        }
        if (e.target.files.length === 0) {
            setErrorMessage('No file selected');
            return;
        }
        reader?.readAsText(e.target.files[0]);
    };

    // function for modal to close
    const handleClose = () => {
        setOpen(false);
    };

    //  change the sentence in file
    const handleChangeAssumption = (sentence) => {
        let fileChanges = [...selectedFile];
        fileChanges[clickedItemMainIndex].assumption[clickedItemIndex] = sentence;

        setSelectedFile(fileChanges);
    }

    // search bar function
    const findWord = (e) => {
        // if the input is empty reset the state (search list)
        if (e.target.value.length === 0) {
            setItemFound([]);
        } else {
            // if word is found in TITLE put the object in array and the array in state
            let foundAssumtions = [];
            selectedFile.forEach(item => {
                // search in title
                if (item.title?.toLowerCase().includes(e.target.value.toLowerCase())) {
                    foundAssumtions.push(item)
                }
                else {
                    // search in assumtions array
                    if (item?.assumption?.filter(assumption => assumption?.includes(e.target.value.toLowerCase())).length > 0) {
                        if (!foundAssumtions.includes(item)) {
                            foundAssumtions.push(item)
                        }
                    }
                }
            })
            setItemFound(foundAssumtions);
        }
    }



    const handleCopyToClipboard = () => {
        console.log('checkbox', checkbox)
        const novo = selectedFile.reduce(function (previousValue, currentValue, currentIndex) {

            console.log('pv', previousValue, 'cv', currentValue, 'ci', currentIndex)
            if (checkbox[currentIndex].length > 0) {
                let newCurrentValue = currentValue?.title;
                currentValue?.assumption?.forEach((assumption, index) =>
                    checkbox[currentIndex].length !== 0 && checkbox[currentIndex]?.includes(index) && (
                        newCurrentValue = newCurrentValue + '\n' + assumption))
                return previousValue + '\n' + newCurrentValue;
            } else {
                return previousValue;
            }
        }, '')
        navigator.clipboard.writeText((novo));
    }

    return (
        <div className='content'>
            <div className='bar'>
                <div className='upload-button'>
                    <Button variant="contained" component="label">
                        Upload JSON file
                        <input hidden type="file" name="file" onChange={(e) => changeHandler(e)} />
                    </Button>
                </div>
                <TextField variant='outlined' type="text" onChange={findWord} sx={{ width: '170px', marginBottom: '15px', borderRadius: '50px' }} label="Search" />
            </div>
            <div className='error-message'>{errorMessage}</div>
            <div className='list'>
                {itemFound.length === 0 ?
                    selectedFile?.map((topic, mainIndex) =>
                        <div key={mainIndex} className="assumption">
                            <div className='topic'>{topic.title}</div>
                            <FormGroup>
                                {topic.assumption.map((item, index) =>
                                    <FormControlLabel
                                        // onChange={() => handleClickOpen(item, mainIndex, index)}
                                        // checked={setCheck(index)}
                                        key={index}
                                        label={item.replace(/[$]/gi, "")}
                                        control={<Checkbox />}
                                        onChange={(e) => handleClickOpen(e, item, mainIndex, index, topic)}
                                    // name={index}
                                    />
                                )}
                            </FormGroup>
                        </div>
                    )
                    : itemFound.map((item, index) =>
                        <div className="assumption" key={index}>
                            <div className='topic'>{item.title}</div>
                            <br />
                            {item.assumption.map(item =>
                                <li>{item.replace(/[$]/gi, "")}</li>)}
                        </div>)
                }
            </div>
            <div className='clipboard-button'>
                <Button onClick={handleCopyToClipboard}> Copy to Clipboard</Button>
            </div>
            <SimpleDialog
                open={open}
                onClose={handleClose}
                item={clickedItem}
                handleChangeAssumption={handleChangeAssumption}
            />
        </div >
    )
}
export default FileUploadPage;

// TODO : on click (uncheck) the pop up should not show
