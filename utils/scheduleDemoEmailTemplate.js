module.exports = ({
    firstName,
    lastName,
    email,
    organization,
    date,
    time,
    countryCode,
    phoneNumber,
    comments,
  }) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:logo" alt="SoftHire Logo" style="max-width: 150px;">
        </div>
  
        <h2 style="color: #333;">New Schedule Demo Request</h2>
  
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tbody>
            <tr>
              <td style="padding: 8px; font-weight: bold;">First Name:</td>
              <td style="padding: 8px;">${firstName}</td>
            </tr>
            <tr style="background-color: #f2f2f2;">
              <td style="padding: 8px; font-weight: bold;">Last Name:</td>
              <td style="padding: 8px;">${lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Email:</td>
              <td style="padding: 8px;">${email}</td>
            </tr>
            <tr style="background-color: #f2f2f2;">
              <td style="padding: 8px; font-weight: bold;">Organization:</td>
              <td style="padding: 8px;">${organization}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Date:</td>
              <td style="padding: 8px;">${date}</td>
            </tr>
            <tr style="background-color: #f2f2f2;">
              <td style="padding: 8px; font-weight: bold;">Time:</td>
              <td style="padding: 8px;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Phone:</td>
              <td style="padding: 8px;">${countryCode} ${phoneNumber}</td>
            </tr>
            <tr style="background-color: #f2f2f2;">
              <td style="padding: 8px; font-weight: bold;">Comments:</td>
              <td style="padding: 8px;">${comments || "None"}</td>
            </tr>
          </tbody>
        </table>
  
       <p style="margin-top: 30px; font-size: 14px; color: #555;">
  This notification was generated automatically following a Schedule Demo request submitted via the SoftHire website. Please review the details above and take appropriate action.
</p>
      </div>
    `;
  };
  