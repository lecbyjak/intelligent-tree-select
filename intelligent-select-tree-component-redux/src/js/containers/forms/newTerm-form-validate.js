const validate = values => {
    const errors = {};

    if(!values.termLabel) {
        errors.termLabel = 'Required'
    }else if (values.termLabel.length < 3){
        errors.termLabel = 'Minimum required length is 3'
    }

    if(!values.termID) {
        errors.termID = 'Required'
    }else if (values.termID.length < 3){
        errors.termID = 'Minimum required length is 3'
    }

    if (values.termProperties && values.termProperties.length) {
        const membersArrayErrors = [];
        values.termProperties.forEach((member, memberIndex) => {
            const memberErrors = {};
            if (!member || !member.key) {
                memberErrors.key = 'Required';
                membersArrayErrors[memberIndex] = memberErrors
            } else if (member.key.length < 3 ){
                memberErrors.key = 'Minimum length is 3';
                membersArrayErrors[memberIndex] = memberErrors
            }
            if (!member || !member.value) {
                memberErrors.value = 'Required';
                membersArrayErrors[memberIndex] = memberErrors
            }else if (member.value.length < 3 ){
                memberErrors.value = 'Minimum length is 3';
                membersArrayErrors[memberIndex] = memberErrors
            }
        });
        if(membersArrayErrors.length) {
            errors.termProperties = membersArrayErrors
        }
    }

    if (values["parent-term"] && values["child-terms"]){
        values["child-terms"].forEach(term => {
            if(values["parent-term"].id === term.id) errors["child-terms"] = "Child term can not be same as parent term"
        })
    }

    return errors
};

export default validate