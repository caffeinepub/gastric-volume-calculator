import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import List "mo:core/List";



actor {
  type Calculation = {
    csa : Float;
    age : Nat;
    weight : Float;
    gv : Float;
    gvPerKg : Float;
    highRisk : Bool;
    timestamp : Int;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userCalculations = Map.empty<Principal, List.List<Calculation>>();

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func calculateAndSave(csa : Float, age : Nat, weight : Float) : async Calculation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform calculations");
    };

    if (weight <= 0) {
      Runtime.trap("Invalid weight: Weight must be greater than zero");
    };

    let gv = 39.44 * csa - 0.2493 * age.toInt().toFloat() + 6.828;
    let gvPerKg = gv / weight;
    let highRisk = gvPerKg > 1.5;

    let calculation : Calculation = {
      csa;
      age;
      weight;
      gv;
      gvPerKg;
      highRisk;
      timestamp = Time.now();
    };

    let existingCalculations = switch (userCalculations.get(caller)) {
      case (null) { List.empty<Calculation>() };
      case (?calcs) { calcs };
    };

    existingCalculations.add(calculation);
    userCalculations.add(caller, existingCalculations);

    calculation;
  };

  public query ({ caller }) func getUserCalculations() : async [Calculation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve calculation history");
    };
    switch (userCalculations.get(caller)) {
      case (null) { [] };
      case (?calcs) { calcs.reverse().toArray() };
    };
  };
};
