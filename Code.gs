/************************************************************
 *               Configuration Variables                    *
 ************************************************************/
const POST_ID = /* Discusion post ID here */;
const USERNAME = /* Scratch username here */;
const PASSWORD = /* Scratch password here */;
const POST_TITLE = /* Forum post title here */;
const DOC_ID = /* Google Doc ID here */;
const API_URL = /* Forum Edit endpoint here */;


const fetch = UrlFetchApp.fetch;



function convert(element, ignore = false) {
    let res = "";
    const num = element.getNumChildren();
    if(num == 0) return "";
    for(let i = 0; i < num; i++) {
        const child = element.getChild(i);
        const type = child.getType().name();
        switch(type) {
            case "PARAGRAPH":
                if(child.getAlignment()=="CENTER" && !ignore) {
                    res += "[center]";
                    if(child.getHeading() == "NORMAL")
                        res += convert(child) + "\n";
                    else res += "[big]" + convert(child) + "[/big]\n";
                    res += "[/center]";
                    break;
                }
                if(child.getHeading() == "NORMAL")
                res += convert(child) + "\n";
                else res += "[big]" + convert(child) + "[/big]\n";
                break;
            case "LIST_ITEM":
                const previous = child.getPreviousSibling().getType().name();
                const next = child.getNextSibling().getType().name();
                if(previous != "LIST_ITEM") {
                    if(child.getGlyphType().name() == "BULLET") res += "[list]\n";
                    else res += "[list=1]\n";
                    console.log(child.getListId());
                    console.log(child.getGlyphType().name());
                }
                res += "[*] " + convert(child) + "\n";
                if(next != "LIST_ITEM") res += "[/list]\n";
                break;
            case "TEXT":
                const txt = child.getText();
                let attr = {"FOREGROUND_COLOR":null,"STRIKETHROUGH":null,"FONT_FAMILY":null,"FONT_SIZE":null,"BACKGROUND_COLOR":null,"UNDERLINE":null,"BOLD":null,"ITALIC":null,"LINK_URL":null}
                let props = [];
                for(let j = 0; j < child.getText().length; j++) {
                    const tempAttr = child.getAttributes(j);
                    let diff = false;
                    let tempProps = [];
                    for(let a in attr) {
                        if(attr[a] != tempAttr[a]) {
                            diff = true;
                        }
                        if(tempAttr[a] != null && tempAttr != false) {
                            tempProps.push(a);
                        }
                    }
                    if(tempAttr.FONT_SIZE != null && tempAttr.FONT_SIZE >= 20) tempProps.push("big");
                    if(tempAttr.FONT_SIZE != null && tempAttr.FONT_SIZE <= 7) tempProps.push("small");
                    if(diff) {
                        for(let p of props.reverse()) {
                            let v = "";
                            switch(p) {
                                case "FOREGROUND_COLOR":
                                    v = "color"
                                    break;
                                case "STRIKETHROUGH":
                                    v = "s"
                                    break;
                                case "UNDERLINE":
                                    v = "u"
                                    break;
                                case "BOLD":
                                    v = "b"
                                    break;
                                case "ITALIC":
                                    v = "i"
                                    break;
                                case "LINK_URL":
                                    v = "url"
                                    break;
                                case "big":
                                    v = "big"
                                    break;
                                case "small":
                                    v = "small"
                                    break;
                                default:
                                    v = null;
                            }
                            if(v != null)
                            res += `[/${v}]`;
                        }
                        props = tempProps;
                        for(let p of props) {
                            let v = "";
                            switch(p) {
                                case "FOREGROUND_COLOR":
                                    v = "color=" + tempAttr.FOREGROUND_COLOR;
                                    break;
                                case "STRIKETHROUGH":
                                    v = "s"
                                    break;
                                case "UNDERLINE":
                                    v = "u"
                                    break;
                                case "BOLD":
                                    v = "b"
                                    break;
                                case "ITALIC":
                                    v = "i"
                                    break;
                                case "LINK_URL":
                                    v = "url=" + tempAttr.LINK_URL;
                                    break;
                                case "big":
                                    v = "big"
                                    break;
                                case "small":
                                    v = "small"
                                    break;
                                default:
                                    v = null;
                            }
                            if(v != null)
                            res += `[${v}]`;
                        }
                        attr = tempAttr;
                    }
                    if(txt.charAt(j) == "[" || txt.charAt(j) == "]")
                        res += "[" + txt.charAt(j) + "]";
                    else res += txt.charAt(j);
                }
                for(let p of props.reverse()) {
                    let v = "";
                    switch(p) {
                        case "FOREGROUND_COLOR":
                            v = "color";
                            break;
                        case "STRIKETHROUGH":
                            v = "s"
                            break;
                        case "UNDERLINE":
                            v = "u"
                            break;
                        case "BOLD":
                            v = "b"
                            break;
                        case "ITALIC":
                            v = "i"
                            break;
                        case "LINK_URL":
                            v = "url";
                            break;
                        case "big":
                            v = "big"
                            break;
                        case "small":
                            v = "small"
                            break;
                        default:
                            v = null;
                    }
                    if(v != null)
                    res += `[/${v}]`;
                }
                break;
            default:
                console.log(type);
                break;
        }
    }
    return res;
}

function myFunction() {
    const doc = DocumentApp.openById(DOC_ID);
    const body = doc.getBody();
    const code = convert(body);
    console.log(code);
    fetch(API_URL, {
        method:"POST",
        payload:JSON.stringify({
            id: POST_ID,
            username: USERNAME,
            password: PASSWORD,
            title: POST_TITLE,
            content: code
        })
    });
}
