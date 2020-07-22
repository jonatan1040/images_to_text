if (/^[0-9]/.test(licensePlate)) {
  if (licensePlate.length == 7 || licensePlate.length == 8) {
    if (sum % 7 == 0) {
      console.log("dbg");
    } else {
      console.log("err, not divided by 7");
    }
    if (licensePlate.length == 7) {
      if (
        licensePlate.endsWith("85") ||
        licensePlate.endsWith("86") ||
        licensePlate.endsWith("87") ||
        licensePlate.endsWith("88") ||
        licensePlate.endsWith("89") ||
        licensePlate.endsWith("00")
      ) {
        console.log("dbc");
      }
    } else {
      console.log("err, not 7 in length");
    }
  } else {
    console.log("err, not 7 or 8 in length");
  }
  if (licensePlate.endsWith("25") || licensePlate.endsWith("26")) {
    console.log("dbp");
  } else {
    console.log("err, does not end with 25/26");
  }
} else {
  console.log("dbm");
  if (licensePlate.endsWith("25") || licensePlate.endsWith("26")) {
    console.log("dbp");
  } else {
    console.log("err, does not end with 25/26");
  }
  if (licensePlate.length == 7 || licensePlate.length == 8) {
    if (sum % 7 == 0) {
      console.log("dbg");
    } else {
      console.log("err, not divided by 7");
    }
    if (licensePlate.length == 7) {
      if (
        licensePlate.endsWith("85") ||
        licensePlate.endsWith("86") ||
        licensePlate.endsWith("87") ||
        licensePlate.endsWith("88") ||
        licensePlate.endsWith("89") ||
        licensePlate.endsWith("00")
      ) {
        console.log("dbc");
      }
    } else {
      console.log("err, not 7 in length");
    }
  } else {
    console.log("err, not 7 or 8 in length");
  }
}
