import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
const coatOfArms = "/coat-of-arms.png";

export function DigitalTravelPassport() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/app/driver/wallet")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Digital Travel Passport
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Republic of Mauritius
          </p>
        </div>
      </div>

      {/* Passport Container */}
      <div className="max-w-4xl mx-auto">
        {!isOpen ? (
          /* Passport Cover */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <motion.div
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-red-800 to-red-900 rounded-2xl shadow-2xl overflow-hidden cursor-pointer aspect-[3/4] max-w-md mx-auto p-12 flex flex-col items-center justify-center relative"
            >
              {/* Subtle Pattern Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.03) 10px, rgba(255,255,255,.03) 20px)',
                }}></div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center text-white space-y-8">
                <div>
                  <p className="text-sm font-light tracking-wider mb-2 opacity-90">REPUBLIC OF</p>
                  <h2 className="text-3xl font-bold tracking-wide">MAURITIUS</h2>
                </div>

                {/* Coat of Arms with Glow Animation */}
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(255,255,255,0.3)",
                      "0 0 40px rgba(255,255,255,0.5)",
                      "0 0 20px rgba(255,255,255,0.3)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto p-4"
                >
                  <img src={coatOfArms} alt="Mauritius Coat of Arms" className="w-full h-full object-contain" />
                </motion.div>

                <div>
                  <h3 className="text-2xl font-bold tracking-widest">PASSPORT</h3>
                  <p className="text-sm font-light tracking-wider mt-1 opacity-90">PASSEPORT</p>
                </div>
              </div>
            </motion.div>

            {/* Swipe Instruction */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-center mt-6"
            >
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                👆 Tap to open passport
              </p>
            </motion.div>
          </motion.div>
        ) : (
          /* Passport Identity Page */
          <motion.div
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="perspective-1000"
          >
            <div className="bg-gradient-to-br from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/20 rounded-2xl shadow-2xl overflow-hidden border-2 border-red-200 dark:border-red-800">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-700 to-red-800 px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-yellow-300" />
                    <div className="text-white">
                      <p className="text-xs font-light">REPUBLIC OF</p>
                      <p className="text-lg font-bold">MAURITIUS</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Passport Content */}
              <div className="p-8">
                <div className="flex gap-8">
                  {/* Left Column - Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-40 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                      <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                        Passport<br/>Photo
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Information */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type / Type</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">P (Passport)</p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Country Code / Code du pays</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">MUS</p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Passport No. / No. du passeport</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">P1234567</p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Surname / Nom</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">SMITH</p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Given Names / Prénoms</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">JOHN MICHAEL</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nationality / Nationalité</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">MAURITIAN</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sex / Sexe</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">M</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date of Birth / Date de naissance</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">15 MAR 1992</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Place of Birth / Lieu de naissance</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">PORT LOUIS</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date of Issue / Date de délivrance</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">01 JAN 2024</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date of Expiry / Date d'expiration</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">01 JAN 2034</p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Authority / Autorité</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">PASSPORT & IMMIGRATION OFFICE</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Machine Readable Zone */}
                <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Machine Readable Zone</p>
                  <div className="font-mono text-xs text-gray-900 dark:text-white space-y-1">
                    <div>P&lt;MUSSMITH&lt;&lt;JOHN&lt;MICHAEL&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
                    <div>P1234567&lt;MUS9203155M3401012&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;04</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}