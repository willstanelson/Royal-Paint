// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Dynamically update the copyright year in the footer
    const currentYearFooter = document.getElementById('currentYearFooter');
    if (currentYearFooter) {
        currentYearFooter.textContent = new Date().getFullYear();
    }

    // --- Bootstrap Contact Modal Loading Logic ---
    const contactModal = document.getElementById('contactModal');
    const contactModalBody = document.getElementById('contactModalBody');

    if (contactModal && contactModalBody) {
        contactModal.addEventListener('show.bs.modal', async () => {
            // Show loading spinner
            contactModalBody.innerHTML = `
                <div class="text-center my-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading contact form...</p>
                </div>
            `;

            try {
                // Fetch the content of contact.html
                const response = await fetch('contact.html');
                const htmlText = await response.text();

                // Parse the fetched HTML to extract only the desired section
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');
                const contactContent = doc.getElementById('contactPageContent'); // The wrapper div

                if (contactContent) {
                    contactModalBody.innerHTML = contactContent.innerHTML;

                    // Re-initialize LLM Message Enhancer for the modal's form
                    // This is crucial because the new form elements are dynamically loaded
                    const enhanceMessageBtnModal = contactModalBody.querySelector('#enhanceMessageBtn');
                    const messageTextareaModal = contactModalBody.querySelector('#message');
                    const llmSuggestionsBoxModal = contactModalBody.querySelector('#llm-suggestions');

                    if (enhanceMessageBtnModal && messageTextareaModal && llmSuggestionsBoxModal) {
                        enhanceMessageBtnModal.addEventListener('click', async () => {
                            const userMessage = messageTextareaModal.value.trim();

                            if (userMessage === "") {
                                llmSuggestionsBoxModal.innerHTML = "Please type something in your message first to get suggestions!";
                                llmSuggestionsBoxModal.classList.remove('d-none');
                                llmSuggestionsBoxModal.classList.remove('loading');
                                return;
                            }

                            llmSuggestionsBoxModal.innerHTML = "";
                            llmSuggestionsBoxModal.classList.remove('d-none');
                            llmSuggestionsBoxModal.classList.add('loading');
                            llmSuggestionsBoxModal.textContent = "Thinking...";

                            try {
                                let chatHistory = [];
                                const prompt = `You are an AI assistant for "Royal Finishers," a painting and design company.
                                A user is typing a message in a contact form. Their current message is: "${userMessage}"

                                Provide concise, helpful suggestions to the user on how they can enhance their message to make it clearer or more comprehensive for Royal Finishers. Suggest details they might include to get a better response, such as:
                                - Specific service needed (e.g., "interior painting", "exterior design", "wallpaper installation")
                                - Type of property (residential, commercial)
                                - Approximate size of the area/number of rooms
                                - Desired timeline (e.g., "within the next month", "flexible")
                                - Any specific styles, colors, or inspirations
                                - Location within Nigeria (if not already clear)

                                Keep the tone professional and helpful. Start directly with suggestions. For example: "To help us provide a more accurate quote, consider including..."`;

                                chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                                const payload = { contents: chatHistory };
                                const apiKey = ""; // Canvas will inject API key here at runtime
                                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                                const llmResponse = await fetch(apiUrl, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(payload)
                                });

                                const llmResult = await llmResponse.json();

                                if (llmResult.candidates && llmResult.candidates.length > 0 &&
                                    llmResult.candidates[0].content && llmResult.candidates[0].content.parts &&
                                    llmResult.candidates[0].content.parts.length > 0) {
                                    const text = llmResult.candidates[0].content.parts[0].text;
                                    llmSuggestionsBoxModal.innerHTML = `<strong>Suggestions:</strong> ${text}`;
                                } else {
                                    llmSuggestionsBoxModal.innerHTML = "Sorry, I couldn't generate suggestions at this moment. Please try again.";
                                }
                            } catch (llmError) {
                                console.error("Error calling Gemini API for message enhancement in modal:", llmError);
                                llmSuggestionsBoxModal.innerHTML = "An error occurred while getting suggestions. Please try again later.";
                            } finally {
                                llmSuggestionsBoxModal.classList.remove('loading');
                            }
                        });
                    }

                    // Re-enable Bootstrap form validation for the loaded form if desired
                    const modalForm = contactModalBody.querySelector('form');
                    if (modalForm) {
                        modalForm.classList.add('needs-validation'); // Add class if not present
                        modalForm.addEventListener('submit', function (event) {
                            if (!modalForm.checkValidity()) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                            modalForm.classList.add('was-validated');
                        }, false);
                    }


                } else {
                    contactModalBody.innerHTML = "<p class='text-danger'>Failed to load contact content. Please try again later.</p>";
                }
            } catch (error) {
                console.error("Error fetching contact.html for modal:", error);
                contactModalBody.innerHTML = "<p class='text-danger'>An error occurred while loading the contact form. Please check your internet connection.</p>";
            }
        });
    }

    // --- LLM Message Enhancement Feature for Contact Us Page (if directly visited) ---
    // This part remains to ensure LLM works if contact.html is opened directly
    // It specifically checks if the modal is NOT present on the page to avoid duplicate listeners
    const enhanceMessageBtnPage = document.getElementById('enhanceMessageBtn');
    const messageTextareaPage = document.getElementById('message');
    const llmSuggestionsBoxPage = document.getElementById('llm-suggestions');

    // Only apply if these elements exist directly on the page (not in a modal context)
    // and if the contactModal element itself is not found (meaning we are on the full contact.html page)
    if (enhanceMessageBtnPage && messageTextareaPage && llmSuggestionsBoxPage && !document.getElementById('contactModal')) {
        enhanceMessageBtnPage.addEventListener('click', async () => {
            const userMessage = messageTextareaPage.value.trim();

            if (userMessage === "") {
                llmSuggestionsBoxPage.innerHTML = "Please type something in your message first to get suggestions!";
                llmSuggestionsBoxPage.classList.remove('d-none');
                llmSuggestionsBoxPage.classList.remove('loading');
                return;
            }

            llmSuggestionsBoxPage.innerHTML = "";
            llmSuggestionsBoxPage.classList.remove('d-none');
            llmSuggestionsBoxPage.classList.add('loading');
            llmSuggestionsBoxPage.textContent = "Thinking...";

            try {
                let chatHistory = [];
                const prompt = `You are an AI assistant for "Royal Finishers," a painting and design company.
                A user is typing a message in a contact form. Their current message is: "${userMessage}"

                Provide concise, helpful suggestions to the user on how they can enhance their message to make it clearer or more comprehensive for Royal Finishers. Suggest details they might include to get a better response, such as:
                - Specific service needed (e.g., "interior painting", "exterior design", "wallpaper installation")
                - Type of property (residential, commercial)
                - Approximate size of the area/number of rooms
                - Desired timeline (e.g., "within the next month", "flexible")
                - Any specific styles, colors, or inspirations
                - Location within Nigeria (if not already clear)

                Keep the tone professional and helpful. Start directly with suggestions. For example: "To help us provide a more accurate quote, consider including..."`;

                chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                const payload = { contents: chatHistory };
                const apiKey = ""; // Canvas will inject API key here at runtime
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    llmSuggestionsBoxPage.innerHTML = `<strong>Suggestions:</strong> ${text}`;
                } else {
                    llmSuggestionsBoxPage.innerHTML = "Sorry, I couldn't generate suggestions at this moment. Please try again.";
                }
            } catch (error) {
                console.error("Error calling Gemini API for message enhancement on page:", error);
                llmSuggestionsBoxPage.innerHTML = "An error occurred while getting suggestions. Please try again later.";
            } finally {
                llmSuggestionsBoxPage.classList.remove('loading');
            }
        });
    }

    // --- General Bootstrap form validation ---
    // This example makes the form elements visually valid/invalid after submission attempt.
    // Looks for forms with the .needs-validation class
    // This applies to forms directly on the page and needs to be re-initialized for modal content
    var forms = document.querySelectorAll('.needs-validation');
    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Handle "Get a Quote" button in Navbar for contact page
    // This makes the "Get a Quote" button in the navbar also trigger the modal when on contact.html
    const navbarQuoteBtn = document.getElementById('navbarQuoteBtn');
    if (navbarQuoteBtn && window.location.pathname.includes('contact.html')) {
        navbarQuoteBtn.setAttribute('data-bs-toggle', 'modal');
        navbarQuoteBtn.setAttribute('data-bs-target', '#contactModal');
    }
});
