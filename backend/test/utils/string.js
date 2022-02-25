export default {
    generateRandomString: function(length) {
        if (!length) {
            length = 10;
        }
        let result = '';
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
        }
        return result;
    },

    generateBulkEmails: function(numberOfEmails = 10) {
        const _this = this;
        let emails = '';
        for (let i = 0; i < numberOfEmails; i++) {
            emails += _this.generateRandomString(10) + '@oneuptime.com,';
        }
        // remove the last comma
        emails = emails.slice(0, emails.length - 1);
        return emails;
    },

    generateRandomDigits: function() {
        return Math.random()
            .toString()
            .slice(2, 11);
    },
};
