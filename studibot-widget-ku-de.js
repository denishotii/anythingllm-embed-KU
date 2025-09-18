fetch('https://studibot.ku.de/svc-api/backend/{"active":"true"}')
    .then(r => {
        console.log('Response received:', r.status);
        return r.json();
    })
    .then(config => {
        const script = document.createElement('script');
        script.setAttribute('data-open-on-load', '');
        script.setAttribute('data-chat-icon', 'chatBubble');
        script.setAttribute('data-brand-image-url', 'https://media.licdn.com/dms/image/v2/C560BAQHeTXXQdIw1Ig/company-logo_200_200/company-logo_200_200/0/1630574912684/katholische_universitt_eichsttt_ingolstadt_logo?e=2147483647&v=beta&t=ebhqPB9VaR2n5N6_NWT7iQbPaXgy_Glcxe7PJEwpdmI');
        script.setAttribute('data-greeting', 'Der KU.Studibot hilft Ihnen, sich bei Ihren Fragen rund um das Studium an der Katholischen Universität Eichstätt-Ingolstadt zurechtzufinden.Bitte vermeiden Sie es, personenbezogene Daten oder sensible Informationen im Chat anzugeben. Bitte beachten Sie: Der KU.StudiBot erteilt keine Rechtsauskünfte. Für verbindliche Informationen ziehen Sie bitte immer die für Sie einschlägige und gültige Rechtsvorschrift heran. Bitte beachten Sie den Disclaimer unterhalb des Chatfensters.');
        script.setAttribute('data-assistant-name', 'KU.StudiBot');
        script.setAttribute('data-assistant-icon', 'https://media.licdn.com/dms/image/v2/C560BAQHeTXXQdIw1Ig/company-logo_200_200/company-logo_200_200/0/1630574912684/katholische_universitt_eichsttt_ingolstadt_logo?e=2147483647&v=beta&t=ebhqPB9VaR2n5N6_NWT7iQbPaXgy_Glcxe7PJEwpdmI')
        script.setAttribute('data-sponsor-link', 'https://www.ku.de/studibot-disclaimer');
        script.setAttribute('data-sponsor-text', 'Disclaimer');
        script.setAttribute('data-embed-id', config.data['embed-id']);
        script.setAttribute('data-base-api-url', config.data.scheme + '://' + config.data.host + config.data['embed-base-api-url']);
        script.setAttribute('data-position', 'bottom-right');
        script.setAttribute('data-button-color', '#002D72');
        script.src = 'https://studibot.ku.de/embed/anythingllm-chat-widget.min.js';
        console.log('Adding script with embed-id:', config.data['embed-id']);
        console.log('Adding script with base-url:', config.data.scheme + '://' + config.data.host + config.data['embed-base-api-url']);
        document.head.appendChild(script);
    })
    .catch(error => {
        console.error('Error fetching config:', error);
    });