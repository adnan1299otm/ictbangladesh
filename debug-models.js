
const apiKey = "AIzaSyA0qeersEGX2wRCal3LNwnk_zvP_2LPSIA";

async function checkModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.name.includes("gemini")) {
                    console.log(m.name);
                }
            });
        } else {
            console.log("Error listing models:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

checkModels();
