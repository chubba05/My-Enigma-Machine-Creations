/** @param {NS} ns */

// Define constants
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Rotor wiring
const rotorI_wiring = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
const rotorII_wiring = "AJDKSIRUXBLHWTMCQGZNPYFVOE";
const rotorIII_wiring = "BDFHJLCPRTXVZNYEIWGAKMUSQO";
const rotorIV_wiring = "ESOVPZJAYQUIRHXLNFTGKDCMWB";
const rotorV_wiring = "VZBRGITYUPSDNHLXAWMJQOFECK";

// Reflector wiring
const reflectorA_wiring = "EJMZALYXVBWFCRQUONTSPIKHGD";
const reflectorB_wiring = "YRUHQSLDPXNGOKMIEBFZCWVJAT";
const reflectorC_wiring = "FVPJIAOYEDRZXWGCTKUQSBNMHL";

export function main(ns) {
  // Set check variables
  let rotors_okay = false;
  let duplicated_rotors = false;
  let reflector_okay = false;
  let positions_okay = false;

  // Check if rotors are valid
  try {
    // If the rotor arguments are valid rotors
    rotors_okay =
      ["I", "II", "III", "IV", "V"].includes(ns.args[1].toUpperCase())
      && ["I", "II", "III", "IV", "V"].includes(ns.args[2].toUpperCase())
      && ["I", "II", "III", "IV", "V"].includes(ns.args[3].toUpperCase())
  } catch { }

  // Check if there are duplicated rotors
  try {
    duplicated_rotors = (
      // If rotor 1 is the same as rotor 2 or 3
      ns.args[1].toUpperCase() == (
        ns.args[2].toUpperCase() || ns.args[3].toUpperCase()
      )
      // If rotor 2 is the same as rotor 3
      || ns.args[2].toUpperCase() == (
        ns.args[3].toUpperCase()
      )
    )
  } catch { }

  // Check if reflector is valid
  try {
    // If the reflector argument is a valid reflector
    reflector_okay = ["A", "B", "C"].includes(ns.args[4].toUpperCase())
  } catch { }

  // Check if rotor positions are valid
  try {
    // If the position arguments are in a valid range
    positions_okay =
      (ns.args[5] > 0) && (ns.args[6] > 0) && (ns.args[7] > 0)
      && (ns.args[5] < 27) && (ns.args[6] < 27) && (ns.args[7] < 27);
  } catch { }

  // Check if there are too many inputs
  let too_many_inputs = ns.args[8];

  // If the script is ran without any arguments
  if (!ns.args[0]) {
    ns.tprint("Usage: run Enigma.js <MESSAGE IN QUOTES> <FIRST ROTOR> <SECOND ROTOR> <THIRD ROTOR> <REFLECTOR> <FIRST ROTOR POSITION> <SECOND ROTOR POSITION> <THIRD ROTOR POSITION>");
    ns.tprint("Info: For more detailed usage information run: run Enigma.js help")

  } else if (
    ns.args[0] && rotors_okay && !duplicated_rotors
    && reflector_okay && positions_okay && !too_many_inputs
  ) {
    // Set message to full uppercase
    let message = ns.args[0].toUpperCase()
    ns.tprint(`Input: ${message}`);

    // Run function to split message
    let encrypted_message = func_split_message(ns, message)
    // Print the full encrypted message
    ns.tprint(encrypted_message);

    // Help for usage
  } else {
    ns.tprint("Usage: run Enigma.js <MESSAGE IN QUOTES> <FIRST ROTOR> <SECOND ROTOR> <THIRD ROTOR> <REFLECTOR> <FIRST ROTOR POSITION> <SECOND ROTOR POSITION> <THIRD ROTOR POSITION>");
    ns.tprint("<MESSAGE IN QUOTES>: Surround your message in single, or double quotation marks");
    ns.tprint("<FIRST ROTOR>: Pick a rotor, either I, II, III, IV, or V");
    ns.tprint("<SECOND ROTOR>: Pick a rotor, either I, II, III, IV, or V");
    ns.tprint("<THIRD ROTOR>: Pick a rotor, either I, II, III, IV, or V");
    ns.tprint("<REFLECTOR>: Pick a reflector, ether A, B, or C");
    ns.tprint("<FIRST ROTOR POSITION>: Pick a rotor start position, from 1 to 26");
    ns.tprint("<SECOND ROTOR POSITION>: Pick a rotor start position, from 1 to 26");
    ns.tprint("<THIRD ROTOR POSITION>: Pick a rotor start position, from 1 to 26");
  }
}

function func_split_message(ns, message) {
  // Set rotors
  let rotor1 = ns.args[1].toUpperCase()
  let rotor2 = ns.args[2].toUpperCase()
  let rotor3 = ns.args[3].toUpperCase()

  // Set reflector
  let reflector = ns.args[4].toUpperCase()

  // Set positions
  let fast_pos = ns.args[5] - 1;
  let medium_pos = ns.args[6] - 1;
  let slow_pos = ns.args[7] - 1;

  // Set encrypted_message to nothing
  let encrypted_message = "Output: ";

  // For each letter in message
  for (let i = 0; i < message.length; i++) {

    // Call function to calculate notch position
    let rotor1_notch = func_calc_notch(rotor1)
    let rotor2_notch = func_calc_notch(rotor2)

    // Set letter to current letter in message
    let letter = message[i];

    // If letter is a letter and not punctuation
    if (alphabet.indexOf(letter) >= 0) {

      // Call function to handle stepping
      let rotor_positions = func_handle_stepping(rotor1_notch, rotor2_notch, fast_pos, medium_pos, slow_pos);

      // Extract each rotor position from array rotor_positions
      fast_pos = rotor_positions[0];
      medium_pos = rotor_positions[1];
      slow_pos = rotor_positions[2];

      // Append the returned promise of func_handle_rotors() to encrypted_message
      encrypted_message += func_handle_rotors(letter, rotor1, fast_pos, rotor2, medium_pos, rotor3, slow_pos, reflector)
    } else {
      // Append current character to encrypted_message
      encrypted_message += letter;
    }
  }

  // Return the full encrypted message
  return encrypted_message;
}

function func_calc_notch(rotor) {
  if (rotor == "I") {
    return "Q";
  } else if (rotor == "II") {
    return "E";
  } else if (rotor == "III") {
    return "V";
  } else if (rotor == "IV") {
    return "J";
  } else {
    return "Z";
  }
}

function func_handle_stepping(rotor1_notch, rotor2_notch, fast_pos, medium_pos, slow_pos) {
  // Stepping code
  let turn_rotor2 = false;
  let turn_rotor3 = false;

  // Log positions of rotors in letter form and compare against the notch
  if (alphabet[fast_pos == rotor1_notch]) {
    turn_rotor2 = true
  }
  if (alphabet[medium_pos == rotor2_notch]) {
    turn_rotor3 = true;
  }

  // Turn rotor 1
  fast_pos += 1;

  // If the first rotor notch is in place turn rotor 2
  if (turn_rotor2 == true) {
    medium_pos += 1;
  }

  // If the second rotor notch is in place turn rotor 2 and rotor 3
  if (turn_rotor3 == true) {
    medium_pos += 1;
    slow_pos += 1;
  }

  return [fast_pos, medium_pos, slow_pos];
}

function func_handle_rotors(letter, rotor1, fast_pos, rotor2, medium_pos, rotor3, slow_pos, reflector) {
  // Call func_rotor to encrypt letter one step at a time
  letter = func_rotor(rotor1, letter, fast_pos, "F")
  letter = func_rotor(rotor2, letter, medium_pos, "F")
  letter = func_rotor(rotor3, letter, slow_pos, "F")

  // Call func_reflector to encrypt to the reflector output
  letter = func_reflector(letter, reflector)

  // Call func_rotor to encrypt letter one step at a time
  letter = func_rotor(rotor3, letter, slow_pos, "B")
  letter = func_rotor(rotor2, letter, medium_pos, "B")
  letter = func_rotor(rotor1, letter, fast_pos, "B")

  // Return the final value of letter
  return letter
}

function func_rotor(rotor, letter, position, direction) {
  // Set letter to position in alphabet plus rotor position
  // With modulo if it goes higher than 25
  letter = alphabet[(alphabet.indexOf(letter) + position) % 26];

  // If it is in the first half of encryption
  if (direction == "F") {
    // Get the index of the letter
    let index = alphabet.indexOf(letter);


    // Check if the rotor is I
    if (rotor == "I") {
      // Check if the resulting index after compensating
      // for the position is less than 0
      if (alphabet.indexOf(rotorI_wiring[index]) - position < 0) {
        // Compensate for the position, add 26 to the letter index
        // and set letter to the corresponding letter
        letter = alphabet[(alphabet.indexOf(rotorI_wiring[index]) - position) + 26];
      } else {
        // Set letter to the corresponding letter after compensating
        letter = alphabet[(alphabet.indexOf(rotorI_wiring[index]) - position)];
      }

      // Check if the rotor is II and do the same as above
    } else if (rotor == "II") {
      if (alphabet.indexOf(rotorII_wiring[index]) - position < 0) {
        letter = alphabet[(alphabet.indexOf(rotorII_wiring[index]) - position) + 26];
      } else {
        letter = alphabet[(alphabet.indexOf(rotorII_wiring[index]) - position)];
      }

      // Check if the rotor is III and do the same as above
    } else if (rotor == "III") {
      if (alphabet.indexOf(rotorIII_wiring[index]) - position < 0) {
        letter = alphabet[(alphabet.indexOf(rotorIII_wiring[index]) - position) + 26];
      } else {
        letter = alphabet[(alphabet.indexOf(rotorIII_wiring[index]) - position)];
      }

      // Check if the rotor is IV and do the same as above
    } else if (rotor == "IV") {
      if (alphabet.indexOf(rotorIV_wiring[index]) - position < 0) {
        letter = alphabet[(alphabet.indexOf(rotorIV_wiring[index]) - position) + 26];
      } else {
        letter = alphabet[(alphabet.indexOf(rotorIV_wiring[index]) - position)];
      }

      // Check if the rotor is V and do the same as above
    } else if (rotor == "V") {
      if (alphabet.indexOf(rotorV_wiring[index]) - position < 0) {
        letter = alphabet[(alphabet.indexOf(rotorV_wiring[index]) - position) + 26];
      } else {
        letter = alphabet[(alphabet.indexOf(rotorV_wiring[index]) - position)];
      }
    }

    // If it is in the second half of encryption
  } else {
    // Check the current rotor and find the index of letter in that rotors wiring list
    if (rotor == "I") {
      // Get the index of the letter in rotor I
      var index = rotorI_wiring.indexOf(letter);
    } else if (rotor == "II") {
      // Get the index of the letter in rotor II
      var index = rotorII_wiring.indexOf(letter);
    } else if (rotor == "III") {
      // Get the index of the letter in rotor III
      var index = rotorIII_wiring.indexOf(letter);
    } else if (rotor == "IV") {
      // Get the index of the letter in rotor IV
      var index = rotorIV_wiring.indexOf(letter);
    } else if (rotor == "V") {
      // Get the index of the letter in rotor V
      var index = rotorV_wiring.indexOf(letter);
    }

    // Check if the resulting index after compensating
    // for the position is less than 0
    if ((index - position) < 0) {
      // Compensate for the position, add 26 to the letter index
      // and set letter to the corresponding letter
      letter = alphabet[(index - position) + 26];
    } else {
      // Set letter to the corresponding letter after compensating
      letter = alphabet[index - position];
    }
  }

  // Return the final value of letter
  return letter;
}

function func_reflector(letter, reflector) {
  // Get the index of the letter
  let index = alphabet.indexOf(letter);

  // Set letter to the corresponding letter in the reflector
  if (reflector == "A") {
    letter = reflectorA_wiring[index];
  }
  if (reflector == "B") {
    letter = reflectorB_wiring[index];
  }
  if (reflector == "C") {
    letter = reflectorC_wiring[index];
  }

  // Return the final value of letter
  return letter;
}
