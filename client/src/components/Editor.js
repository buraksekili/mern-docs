/* eslint-disable default-case */
import React, {
    useMemo,
    useState,
    useCallback,
    useEffect,
    useContext,
    useRef,
} from "react";
import { createEditor, Transforms, Editor, Text, Node } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import axios from "axios";
import "../styles/editor.css";
import UserContext from "./context/UserContext";
import mongoose from "mongoose";
import Loading from "./modal/Loading";

const CustomEditor = {
    isBoldMarkActive(editor) {
        const [match] = Editor.nodes(editor, {
            match: (n) => n.bold === true,
            universal: true,
        });

        return !!match;
    },

    isItalicMarkActive(editor) {
        const [match] = Editor.nodes(editor, {
            match: (n) => n.italic === true,
            universal: true,
        });

        return !!match;
    },

    isCodeBlockActive(editor) {
        const [match] = Editor.nodes(editor, {
            match: (n) => n.type === "code",
        });

        return !!match;
    },

    isQuoteBlockActive(editor) {
        const [match] = Editor.nodes(editor, {
            match: (n) => n.type === "block-quote",
        });

        return !!match;
    },

    isBlockActive(editor, format) {
        const [match] = Editor.nodes(editor, {
            match: (n) => n.type === format,
        });

        return !!match;
    },

    toggleBoldMark(editor) {
        const isActive = CustomEditor.isBoldMarkActive(editor);
        Transforms.setNodes(
            editor,
            { bold: isActive ? null : true },
            { match: (n) => Text.isText(n), split: true }
        );
    },

    toggleItalicMark(editor) {
        const isActive = CustomEditor.isItalicMarkActive(editor);
        Transforms.setNodes(
            editor,
            { italic: isActive ? null : true },
            { match: (n) => Text.isText(n), split: true }
        );
    },

    toggleCodeBlock(editor) {
        const isActive = CustomEditor.isCodeBlockActive(editor);
        Transforms.setNodes(
            editor,
            { type: isActive ? null : "code" },
            { match: (n) => Editor.isBlock(editor, n) }
        );
    },

    toggleQuoteBlock(editor) {
        const isActive = CustomEditor.isQuoteBlockActive(editor);
        Transforms.setNodes(
            editor,
            { type: isActive ? null : "block-quote" },
            { match: (n) => Editor.isBlock(editor, n) }
        );
    },

    toggleBlock(editor, format) {
        const isActive = CustomEditor.isBlockActive(editor, format);
        Transforms.setNodes(
            editor,
            { type: isActive ? null : format },
            { match: (n) => Editor.isBlock(editor, n) }
        );
    },
};

// Define a serializing function that takes a value and returns a string.
const serialize = (value) => {
    return (
        value
            // Return the string content of each paragraph in the value's children.
            .map((n) => Node.string(n))
            // Join them all with line breaks denoting paragraphs.
            .join("\n")
    );
};

// Define a deserializing function that takes a string and returns a value.
const deserialize = (string) => {
    // Return a value array of children derived by splitting the string.
    return string.split("\n").map((line) => {
        return {
            children: [{ text: line }],
        };
    });
};

function TextEditor({ history, location }) {
    const [newDoc, setNewDoc] = useState(undefined);
    const [docId, setDocId] = useState(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef();
    const statusMessageRef = useRef();

    function saveIntoDb() {
        axios
            .post("/save", {
                serialized: serialize(value),
                doc_id: docId,
                title: inputRef.current.value,
            })
            .then((res) => {
                statusMessageRef.current.innerHTML = "Saved!";
                statusMessageRef.current.style.color = "greenyellow";
                setIsSaving(false);
            })
            .catch((e) => {
                statusMessageRef.current.innerHTML = "Error!";
                statusMessageRef.current.style.color = "red";
                console.error({ e });
            });
    }

    const editor = useMemo(() => withReact(createEditor()), []);
    const [value, setValue] = useState([
        {
            type: "paragraph",
            children: [{ text: "" }],
        },
    ]);

    useEffect(() => {
        if (location.state && location.state.id && !location.state.newDoc) {
            setDocId(location.state.id);
            axios
                .get("/getdoc", {
                    params: {
                        id: location.state.id,
                    },
                })
                .then((res) => {
                    setValue(deserialize(res.data.content));
                })
                .catch((e) => console.error(e));
        }
    }, []);

    if (location.state && location.state.newDoc && !newDoc) {
        // console.log("New Doc");
        setDocId(mongoose.Types.ObjectId());
        setNewDoc(true);
    }

    const { user } = useContext(UserContext);

    // Define a rendering function based on the element passed to `props`. We use
    // `useCallback` here to memoize the function for subsequent renders.
    const renderElement = useCallback((props) => {
        switch (props.element.type) {
            case "code":
                return <CodeElement {...props} />;
            case "block-quote":
                return <QuoteElement {...props} />;
            case "numbered-list":
                return <NumberedList {...props} />;
            case "bulleted-list":
                return (
                    <ul>
                        <li {...props.attributes}>{props.children}</li>
                    </ul>
                );
            default:
                return <DefaultElement {...props} />;
        }
    }, []);

    const renderLeaf = useCallback((props) => {
        return <Leaf {...props} />;
    }, []);

    return (
        <div>
            {!user.id ? (
                history.push("/login")
            ) : (
                <>
                    {isSaving && <Loading />}
                    <Slate
                        editor={editor}
                        value={value}
                        onChange={(value) => {
                            setValue(value);
                        }}
                    >
                        <div className="buttons">
                            <button
                                className="buttons-bold"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    CustomEditor.toggleBoldMark(editor);
                                }}
                            ></button>

                            <button
                                className="buttons-italic"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    CustomEditor.toggleItalicMark(editor);
                                }}
                            ></button>
                            <button
                                className="buttons-code"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    CustomEditor.toggleCodeBlock(editor);
                                }}
                            ></button>
                            <button
                                className="buttons-quote"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    CustomEditor.toggleQuoteBlock(editor);
                                }}
                            ></button>
                            <button
                                className="buttons-list-num"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    CustomEditor.toggleBlock(
                                        editor,
                                        "numbered-list"
                                    );
                                }}
                            ></button>
                            <button
                                className="buttons-list-bullet"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    CustomEditor.toggleBlock(
                                        editor,
                                        "bulleted-list"
                                    );
                                }}
                            ></button>

                            <input
                                className="filename-input"
                                type="text"
                                placeholder="Filename"
                                ref={inputRef}
                            />

                            <button
                                className="buttons-save"
                                onClick={() => {
                                    setIsSaving(true);
                                    saveIntoDb();
                                }}
                            >
                                save
                            </button>

                            <label
                                className="buttons-status-label"
                                ref={statusMessageRef}
                            ></label>
                        </div>
                        <div className="editor">
                            <Editable
                                editor={editor}
                                renderElement={renderElement}
                                renderLeaf={renderLeaf}
                                onKeyDown={(event) => {
                                    if (!event.ctrlKey) {
                                        return;
                                    }

                                    switch (event.key) {
                                        case "`": {
                                            event.preventDefault();
                                            CustomEditor.toggleCodeBlock(
                                                editor
                                            );
                                            break;
                                        }

                                        case "b": {
                                            event.preventDefault();
                                            CustomEditor.toggleBoldMark(editor);
                                            break;
                                        }
                                    }
                                }}
                            />
                        </div>
                    </Slate>
                </>
            )}
        </div>
    );
}

const Leaf = (props) => {
    return (
        <span
            {...props.attributes}
            style={{
                fontWeight: props.leaf.bold ? "bold" : "normal",
                fontStyle: props.leaf.italic ? "italic" : "normal",
            }}
        >
            {props.children}
        </span>
    );
};

const CodeElement = (props) => {
    return (
        <pre {...props.attributes}>
            <code>{props.children}</code>
        </pre>
    );
};

const QuoteElement = (props) => {
    return (
        <pre {...props.attributes}>
            <blockquote>{props.children}</blockquote>
        </pre>
    );
};

const NumberedList = (props) => {
    return (
        <ol {...props.attributes}>
            <li>{props.children}</li>
        </ol>
    );
};

const DefaultElement = (props) => {
    return <p {...props.attributes}>{props.children}</p>;
};

export default TextEditor;
