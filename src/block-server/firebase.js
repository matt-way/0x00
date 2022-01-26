import firebase from 'firebase/compat/app'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import * as settingsActions from 'state/settings/interface'

const firebaseConfig = {
  apiKey: 'AIzaSyBILWwGqED4Co4uIt3uaKe5uzM41-ECZNA',
  authDomain: 'x15-9e8ff.firebaseapp.com',
  projectId: 'x15-9e8ff',
  storageBucket: 'x15-9e8ff.appspot.com',
  messagingSenderId: '383183583940',
  appId: '1:383183583940:web:503c4b488b7bbf4cbd2791',
}

const firebaseApp = firebase.initializeApp(firebaseConfig)
const firebaseAuthUI = new firebaseui.auth.AuthUI(firebase.auth())

function initFirebase(store) {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log('user signed in', user.email)
      store.dispatch(
        settingsActions.updateValue('user', {
          email: user.email,
          emailVerified: user.emailVerified,
        })
      )
    } else {
      console.log('user signed out')
      store.dispatch(settingsActions.removePath('user'))
    }
  })

  firebase.auth().onIdTokenChanged(user => {
    console.log('id token changed', user)
    // may need to do user.reload()
  })
}

function startFirebaseAuth(element, success, error) {
  return firebaseAuthUI.start(element, {
    signInOptions: [
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        requireDisplayName: false,
      },
    ],
    signInFlow: 'popup',
    callbacks: {
      signInSuccessWithAuthResult: authResult => {
        console.log('signInSuccessWithAuthResult', authResult)
        firebase.auth().updateCurrentUser(authResult.user)
        //console.log('jsoned', )
        if (!authResult.user.emailVerified) {
        }
        return false
      },
      signInFailure: error => {
        console.log('signInFailure', error)
        return false
      },
    },
  })
}

function sendVerificationEmail() {
  return new Promise((resolve, reject) => {
    firebase
      .auth()
      .currentUser.sendEmailVerification()
      .then(
        () => {
          resolve()
        },
        error => {
          reject(error)
        }
      )
  })
}

export { firebaseApp, initFirebase, startFirebaseAuth, sendVerificationEmail }
