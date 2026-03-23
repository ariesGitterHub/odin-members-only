      <!-- <input id="us-state-edit-profile-admin" class="bold" type="text" name="us_state" /> -->
      <!-- <select id="us-state-edit-profile-admin" name="us_state">
        <option value="AL" selected>AL</option>
        <option value="AK">AK</option>
        <option value="AZ">AZ</option>
        <option value="AR">AR</option>
        <option value="CA">CA</option>
        <option value="CO">CO</option>
        <option value="CT">CT</option>
        <option value="DC">DC</option>
        <option value="DE">DE</option>
        <option value="FL">FL</option>
        <option value="GA">GA</option>
        <option value="HI">HI</option>
        <option value="ID">ID</option>
        <option value="IL">IL</option>
        <option value="IN">IN</option>
        <option value="IA">IA</option>
        <option value="KS">KS</option>
        <option value="KY">KY</option>
        <option value="LA">LA</option>
        <option value="ME">ME</option>
        <option value="MD">MD</option>
        <option value="MA">MA</option>
        <option value="MI">MI</option>
        <option value="MN">MN</option>
        <option value="MS">MS</option>
        <option value="MO">MO</option>
        <option value="MT">MT</option>
        <option value="NE">NE</option>
        <option value="NV">NV</option>
        <option value="NH">NH</option>
        <option value="NJ">NJ</option>
        <option value="NM">NM</option>
        <option value="NY">NY</option>
        <option value="NC">NC</option>
        <option value="ND">ND</option>
        <option value="OH">OH</option>
        <option value="OK">OK</option>
        <option value="OR">OR</option>
        <option value="PA">PA</option>
        <option value="RI">RI</option>
        <option value="SC">SC</option>
        <option value="SD">SD</option>
        <option value="TN">TN</option>
        <option value="TX">TX</option>
        <option value="UT">UT</option>
        <option value="VT">VT</option>
        <option value="VA">VA</option>
        <option value="WA">WA</option>
        <option value="WV">WV</option>
        <option value="WI">WI</option>
        <option value="WY">WY</option>
      </select> -->


//admin-edit.ejs
                  <select id="us-state-admin-edit-page" name="us_state">
                    <option value="" disabled <%= !formData?.us_state ? "selected" : "" %>>Choose state</option>
                    <option value="AL" <%= formData?.us_state === "AL" ? "selected" : "" %>>Alabama</option>
                    <option value="AK" <%= formData?.us_state === "AK" ? "selected" : "" %>>Alaska</option>
                    <option value="AZ" <%= formData?.us_state === "AZ" ? "selected" : "" %>>Arizona</option>
                    <option value="AR" <%= formData?.us_state === "AR" ? "selected" : "" %>>Arkansas</option>
                    <option value="CA" <%= formData?.us_state === "CA" ? "selected" : "" %>>California</option>
                    <option value="CO" <%= formData?.us_state === "CO" ? "selected" : "" %>>Colorado</option>
                    <option value="CT" <%= formData?.us_state === "CT" ? "selected" : "" %>>Connecticut</option>
                    <option value="DE" <%= formData?.us_state === "DE" ? "selected" : "" %>>Delaware</option>
                    <option value="DC" <%= formData?.us_state === "DC" ? "selected" : "" %>>Washington, DC</option>
                    <option value="FL" <%= formData?.us_state === "FL" ? "selected" : "" %>>Florida</option>
                    <option value="GA" <%= formData?.us_state === "GA" ? "selected" : "" %>>Georgia</option>
                    <option value="HI" <%= formData?.us_state === "HI" ? "selected" : "" %>>Hawaii</option>
                    <option value="ID" <%= formData?.us_state === "ID" ? "selected" : "" %>>Idaho</option>
                    <option value="IL" <%= formData?.us_state === "IL" ? "selected" : "" %>>Illinois</option>
                    <option value="IN" <%= formData?.us_state === "IN" ? "selected" : "" %>>Indiana</option>
                    <option value="IA" <%= formData?.us_state === "IA" ? "selected" : "" %>>Iowa</option>
                    <option value="KS" <%= formData?.us_state === "KS" ? "selected" : "" %>>Kansas</option>
                    <option value="KY" <%= formData?.us_state === "KY" ? "selected" : "" %>>Kentucky</option>
                    <option value="LA" <%= formData?.us_state === "LA" ? "selected" : "" %>>Louisiana</option>
                    <option value="ME" <%= formData?.us_state === "ME" ? "selected" : "" %>>Maine</option>
                    <option value="MD" <%= formData?.us_state === "MD" ? "selected" : "" %>>Maryland</option>
                    <option value="MA" <%= formData?.us_state === "MA" ? "selected" : "" %>>Massachusetts</option>
                    <option value="MI" <%= formData?.us_state === "MI" ? "selected" : "" %>>Michigan</option>
                    <option value="MN" <%= formData?.us_state === "MN" ? "selected" : "" %>>Minnesota</option>
                    <option value="MS" <%= formData?.us_state === "MS" ? "selected" : "" %>>Mississippi</option>
                    <option value="MO" <%= formData?.us_state === "MO" ? "selected" : "" %>>Missouri</option>
                    <option value="MT" <%= formData?.us_state === "MT" ? "selected" : "" %>>Montana</option>
                    <option value="NE" <%= formData?.us_state === "NE" ? "selected" : "" %>>Nebraska</option>
                    <option value="NV" <%= formData?.us_state === "NV" ? "selected" : "" %>>Nevada</option>
                    <option value="NH" <%= formData?.us_state === "NH" ? "selected" : "" %>>New Hampshire</option>
                    <option value="NJ" <%= formData?.us_state === "NJ" ? "selected" : "" %>>New Jersey</option>
                    <option value="NM" <%= formData?.us_state === "NM" ? "selected" : "" %>>New Mexico</option>
                    <option value="NY" <%= formData?.us_state === "NY" ? "selected" : "" %>>New York</option>
                    <option value="NC" <%= formData?.us_state === "NC" ? "selected" : "" %>>North Carolina</option>
                    <option value="ND" <%= formData?.us_state === "ND" ? "selected" : "" %>>North Dakota</option>
                    <option value="OH" <%= formData?.us_state === "OH" ? "selected" : "" %>>Ohio</option>
                    <option value="OK" <%= formData?.us_state === "OK" ? "selected" : "" %>>Oklahoma</option>
                    <option value="OR" <%= formData?.us_state === "OR" ? "selected" : "" %>>Oregon</option>
                    <option value="PA" <%= formData?.us_state === "PA" ? "selected" : "" %>>Pennsylvania</option>
                    <option value="RI" <%= formData?.us_state === "RI" ? "selected" : "" %>>Rhode Island</option>
                    <option value="SC" <%= formData?.us_state === "SC" ? "selected" : "" %>>South Carolina</option>
                    <option value="SD" <%= formData?.us_state === "SD" ? "selected" : "" %>>South Dakota</option>
                    <option value="TN" <%= formData?.us_state === "TN" ? "selected" : "" %>>Tennessee</option>
                    <option value="TX" <%= formData?.us_state === "TX" ? "selected" : "" %>>Texas</option>
                    <option value="UT" <%= formData?.us_state === "UT" ? "selected" : "" %>>Utah</option>
                    <option value="VT" <%= formData?.us_state === "VT" ? "selected" : "" %>>Vermont</option>
                    <option value="VA" <%= formData?.us_state === "VA" ? "selected" : "" %>>Virginia</option>
                    <option value="WA" <%= formData?.us_state === "WA" ? "selected" : "" %>>Washington</option>
                    <option value="WV" <%= formData?.us_state === "WV" ? "selected" : "" %>>West Virginia</option>
                    <option value="WI" <%= formData?.us_state === "WI" ? "selected" : "" %>>Wisconsin</option>
                    <option value="WY" <%= formData?.us_state === "WY" ? "selected" : "" %>>Wyoming</option>
                  </select>

                  //member-invite.ejs
                  <select id="us-state-member-invite-page" name="us_state" required>
              <option value="" disabled <%= !formData?.us_state ? "selected" : "" %>>Choose state</option>
              <option value="AL" <%= formData?.us_state === "AL" ? "selected" : "" %>>Alabama</option>
              <option value="AK" <%= formData?.us_state === "AK" ? "selected" : "" %>>Alaska</option>
              <option value="AZ" <%= formData?.us_state === "AZ" ? "selected" : "" %>>Arizona</option>
              <option value="AR" <%= formData?.us_state === "AR" ? "selected" : "" %>>Arkansas</option>
              <option value="CA" <%= formData?.us_state === "CA" ? "selected" : "" %>>California</option>
              <option value="CO" <%= formData?.us_state === "CO" ? "selected" : "" %>>Colorado</option>
              <option value="CT" <%= formData?.us_state === "CT" ? "selected" : "" %>>Connecticut</option>
              <option value="DE" <%= formData?.us_state === "DE" ? "selected" : "" %>>Delaware</option>
              <option value="DC" <%= formData?.us_state === "DC" ? "selected" : "" %>>Washington, DC</option>
              <option value="FL" <%= formData?.us_state === "FL" ? "selected" : "" %>>Florida</option>
              <option value="GA" <%= formData?.us_state === "GA" ? "selected" : "" %>>Georgia</option>
              <option value="HI" <%= formData?.us_state === "HI" ? "selected" : "" %>>Hawaii</option>
              <option value="ID" <%= formData?.us_state === "ID" ? "selected" : "" %>>Idaho</option>
              <option value="IL" <%= formData?.us_state === "IL" ? "selected" : "" %>>Illinois</option>
              <option value="IN" <%= formData?.us_state === "IN" ? "selected" : "" %>>Indiana</option>
              <option value="IA" <%= formData?.us_state === "IA" ? "selected" : "" %>>Iowa</option>
              <option value="KS" <%= formData?.us_state === "KS" ? "selected" : "" %>>Kansas</option>
              <option value="KY" <%= formData?.us_state === "KY" ? "selected" : "" %>>Kentucky</option>
              <option value="LA" <%= formData?.us_state === "LA" ? "selected" : "" %>>Louisiana</option>
              <option value="ME" <%= formData?.us_state === "ME" ? "selected" : "" %>>Maine</option>
              <option value="MD" <%= formData?.us_state === "MD" ? "selected" : "" %>>Maryland</option>
              <option value="MA" <%= formData?.us_state === "MA" ? "selected" : "" %>>Massachusetts</option>
              <option value="MI" <%= formData?.us_state === "MI" ? "selected" : "" %>>Michigan</option>
              <option value="MN" <%= formData?.us_state === "MN" ? "selected" : "" %>>Minnesota</option>
              <option value="MS" <%= formData?.us_state === "MS" ? "selected" : "" %>>Mississippi</option>
              <option value="MO" <%= formData?.us_state === "MO" ? "selected" : "" %>>Missouri</option>
              <option value="MT" <%= formData?.us_state === "MT" ? "selected" : "" %>>Montana</option>
              <option value="NE" <%= formData?.us_state === "NE" ? "selected" : "" %>>Nebraska</option>
              <option value="NV" <%= formData?.us_state === "NV" ? "selected" : "" %>>Nevada</option>
              <option value="NH" <%= formData?.us_state === "NH" ? "selected" : "" %>>New Hampshire</option>
              <option value="NJ" <%= formData?.us_state === "NJ" ? "selected" : "" %>>New Jersey</option>
              <option value="NM" <%= formData?.us_state === "NM" ? "selected" : "" %>>New Mexico</option>
              <option value="NY" <%= formData?.us_state === "NY" ? "selected" : "" %>>New York</option>
              <option value="NC" <%= formData?.us_state === "NC" ? "selected" : "" %>>North Carolina</option>
              <option value="ND" <%= formData?.us_state === "ND" ? "selected" : "" %>>North Dakota</option>
              <option value="OH" <%= formData?.us_state === "OH" ? "selected" : "" %>>Ohio</option>
              <option value="OK" <%= formData?.us_state === "OK" ? "selected" : "" %>>Oklahoma</option>
              <option value="OR" <%= formData?.us_state === "OR" ? "selected" : "" %>>Oregon</option>
              <option value="PA" <%= formData?.us_state === "PA" ? "selected" : "" %>>Pennsylvania</option>
              <option value="RI" <%= formData?.us_state === "RI" ? "selected" : "" %>>Rhode Island</option>
              <option value="SC" <%= formData?.us_state === "SC" ? "selected" : "" %>>South Carolina</option>
              <option value="SD" <%= formData?.us_state === "SD" ? "selected" : "" %>>South Dakota</option>
              <option value="TN" <%= formData?.us_state === "TN" ? "selected" : "" %>>Tennessee</option>
              <option value="TX" <%= formData?.us_state === "TX" ? "selected" : "" %>>Texas</option>
              <option value="UT" <%= formData?.us_state === "UT" ? "selected" : "" %>>Utah</option>
              <option value="VT" <%= formData?.us_state === "VT" ? "selected" : "" %>>Vermont</option>
              <option value="VA" <%= formData?.us_state === "VA" ? "selected" : "" %>>Virginia</option>
              <option value="WA" <%= formData?.us_state === "WA" ? "selected" : "" %>>Washington</option>
              <option value="WV" <%= formData?.us_state === "WV" ? "selected" : "" %>>West Virginia</option>
              <option value="WI" <%= formData?.us_state === "WI" ? "selected" : "" %>>Wisconsin</option>
              <option value="WY" <%= formData?.us_state === "WY" ? "selected" : "" %>>Wyoming</option>
          </select>

          //edit-profile.ejs 
                <select id="us-state-edit-profile" name="us_state">
        <option value="" selected disabled>Choose state</option>
        <option value="AL">Alabama</option>
        <option value="AK">Alaska</option>
        <option value="AZ">Arizona</option>
        <option value="AR">Arkansas</option>
        <option value="CA">California</option>
        <option value="CO">Colorado</option>
        <option value="CT">Connecticut</option>
        <option value="DE">Delaware</option>
        <option value="DC">Washington, DC</option>
        <option value="FL">Florida</option>
        <option value="GA">Georgia</option>
        <option value="HI">Hawaii</option>
        <option value="ID">Idaho</option>
        <option value="IL">Illinois</option>
        <option value="IN">Indiana</option>
        <option value="IA">Iowa</option>
        <option value="KS">Kansas</option>
        <option value="KY">Kentucky</option>
        <option value="LA">Louisiana</option>
        <option value="ME">Maine</option>
        <option value="MD">Maryland</option>
        <option value="MA">Massachusetts</option>
        <option value="MI">Michigan</option>
        <option value="MN">Minnesota</option>
        <option value="MS">Mississippi</option>
        <option value="MO">Missouri</option>
        <option value="MT">Montana</option>
        <option value="NE">Nebraska</option>
        <option value="NV">Nevada</option>
        <option value="NH">New Hampshire</option>
        <option value="NJ">New Jersey</option>
        <option value="NM">New Mexico</option>
        <option value="NY">New York</option>
        <option value="NC">North Carolina</option>
        <option value="ND">North Dakota</option>
        <option value="OH">Ohio</option>
        <option value="OK">Oklahoma</option>
        <option value="OR">Oregon</option>
        <option value="PA">Pennsylvania</option>
        <option value="RI">Rhode Island</option>
        <option value="SC">South Carolina</option>
        <option value="SD">South Dakota</option>
        <option value="TN">Tennessee</option>
        <option value="TX">Texas</option>
        <option value="UT">Utah</option>
        <option value="VT">Vermont</option>
        <option value="VA">Virginia</option>
        <option value="WA">Washington</option>
        <option value="WV">West Virginia</option>
        <option value="WI">Wisconsin</option>
        <option value="WY">Wyoming</option>
      </select>